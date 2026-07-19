import { auth } from "@auth";
import { ApiError } from "@models";
import { convertBody, urlConParametros, type ParamsBase } from "@utils";
import { redirect } from "next/navigation";

/**
 * Opciones de configuración para las peticiones HTTP con RequestSSR.
 * @template TParams Tipo de los parámetros de consulta y ruta.
 * @template TBody Tipo del cuerpo de la petición.
 * @property {string} [url] URL opcional si se prefiere pasar la configuración en un solo objeto.
 * @property {TParams} [params] Parámetros de ruta (ej: `{userId}`) y query parameters (`queryParams`).
 * @property {TBody} [body] Cuerpo de la petición (POST, PUT, PATCH).
 * @property {string} [token] Token de autorización explícito (se inyecta automático en servidor si falta).
 * @property {"json" | "blob" | "text" | "arraybuffer"} [responseType] Tipo de respuesta esperada.
 * @property {string[]} [tags] Etiquetas de caché de Next para invalidación (revalidateTag).
 * @property {number | false} [revalidate] Tiempo de vida de la caché (segundos, false permanente, 0 no almacenar).
 */
export interface RequestSSROptions<TParams extends ParamsBase = ParamsBase, TBody = unknown> extends Omit<RequestInit, "body"> {
  url?: string;
  params?: TParams;
  body?: TBody;
  token?: string;
  responseType?: "json" | "blob" | "text" | "arraybuffer";
  tags?: string[];
  revalidate?: number | false;
}

/**
 * Realiza una petición HTTP optimizada para Server-Side Rendering (SSR) y Server Components en Next.js.
 * Automatiza la interpolación de parámetros en la ruta, la serialización de query parameters, la inyección 
 * del token de sesión de NextAuth y el mapeo de errores del backend de Django.
 * 
 * @template TResponse Tipo esperado del cuerpo de la respuesta exitosa.
 * @template TParams Tipo de los parámetros de ruta y consulta.
 * @template TBody Tipo del cuerpo de la petición.
 * 
 * @param urlOrOptions URL relativa de la API (ej: "/limnigrafos") o un objeto de configuración que contenga la propiedad `url`.
 * @param options Configuración de la petición (método, cabeceras, body, parámetros, tags de caché, etc.).
 * @returns Promesa que resuelve al tipo TResponse.
 * @throws {ApiError} Si ocurre un error de red o el backend Django devuelve una respuesta fallida (BackendError).
 */
export async function RequestSSR<TResponse, TParams extends ParamsBase = ParamsBase, TBody = unknown>(
  urlOrOptions: string | ({ url: string } & RequestSSROptions<TParams, TBody>),
  options?: RequestSSROptions<TParams, TBody>
): Promise<TResponse> {
  if (typeof window !== "undefined") {
    throw new Error("RequestSSR solo puede ser ejecutado en el servidor.");
  }

  const urlPath = typeof urlOrOptions === "string" ? urlOrOptions : urlOrOptions.url;
  const finalOptions = typeof urlOrOptions === "string" ? (options || {}) : urlOrOptions;

  const baseUrl = process.env.API_URL!;
  
  // Substituir variables de ruta URL
  let processedPath = urlPath;
  if (finalOptions.params && Object.keys(finalOptions.params).length > 0) {
    processedPath = urlConParametros(urlPath, finalOptions.params);
  }

  // Construir query parameters
  let queryString = "";
  if (finalOptions.params?.queryParams) {
    const queryParams = finalOptions.params.queryParams;
    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const paramsStr = searchParams.toString();
    if (paramsStr) {
      queryString = `?${paramsStr}`;
    }
  }

  const fullUrl = `${baseUrl}${processedPath.startsWith("/") ? "" : "/"}${processedPath}${queryString}`;

  // Obtener el token de sesión si no se pasó token = ""
  let token = finalOptions.token;
  if (token !== "") {
    if (!token) {
      try {
        const session = await auth();
        token = session?.accessToken;
      } catch (err) {
        console.warn("Could not retrieve session token on server in RequestSSR:", err);
      }
    }
  }

  // Configuración de cabeceras (headers)
  const headers = new Headers(finalOptions.headers);
  
  if (!headers.has("Content-Type") && finalOptions.body !== undefined && !(finalOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && token !== "" && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Opciones de caché nativa de Next.js
  const nextConfig: NextFetchRequestConfig = {};
  if (finalOptions.tags) nextConfig.tags = finalOptions.tags;
  if (finalOptions.revalidate !== undefined) nextConfig.revalidate = finalOptions.revalidate;

  // Serialización del cuerpo (body) si corresponde
  const body = convertBody(finalOptions.body);

  const config: RequestInit = {
    method: finalOptions.method || "GET",
    ...finalOptions,
    headers,
    body,
    next: {
      ...finalOptions.next,
      ...nextConfig,
    }
  };

  let response: Response;
  try {
    response = await fetch(fullUrl, config);
  } catch (error) {
    const netError = error as Error;
    throw new ApiError(
      "NETWORK_ERROR",
      "No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet o el estado del backend.",
      netError?.message || String(netError)
    );
  }

  // Procesamiento de error del Backend (BackendError)
  if (!response.ok) {
    if (response.status === 401) {
      // Redirigimos a una página de logout en el cliente para que borre la cookie
      // ya que Next.js no permite borrar cookies durante el renderizado de un Server Component.
      redirect("/logout");
    }

    let errorPayload: {
      codigo?: number,
      descripcion_usuario?: string,
      descripcion_tecnica?: string
    } = {};
    try {
      errorPayload = await response.json();
    } catch {
      try {
        errorPayload.descripcion_tecnica = await response.text();
      } catch {
        errorPayload.descripcion_tecnica = "No se pudo leer el cuerpo de la respuesta de error.";
      }
    }

    throw new ApiError(
      errorPayload.codigo || response.status,
      errorPayload.descripcion_usuario || "Ocurrió un error inesperado al procesar la solicitud.",
      errorPayload.descripcion_tecnica || `Error HTTP ${response.status}: ${response.statusText}`
    );
  }

  const responseType = finalOptions.responseType || "json";
  
  switch (responseType) {
    case "blob":
      return (await response.blob()) as unknown as TResponse;
    case "text":
      return (await response.text()) as unknown as TResponse;
    case "arraybuffer":
      return (await response.arrayBuffer()) as unknown as TResponse;
    case "json":
    default:
      if (response.status === 204) {
        return {} as TResponse;
      }
      return (await response.json()) as Promise<TResponse>;
  }
}
