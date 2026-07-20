import type { ParamsBase } from "@models";

export function urlConParametros<TParams extends ParamsBase>(
  baseUrl: string,
  parametros: TParams,
): string {
  let url = baseUrl;

  if (!baseUrl) {
    console.error("❌ Error: La URL base es undefined");
    return "";
  }

  const parametrosEnUrl = url.match(/{\w+}/g);

  if (parametrosEnUrl) {
    parametrosEnUrl.forEach((param) => {
      const key = param.replace(/[{}]/g, "");
      if (key === "queryParams") {
        return;
      }
      const paramValue = parametros[key];
      if (paramValue !== undefined && paramValue !== null) {
        url = url.replace(param, String(paramValue));
      } else {
        console.warn(
          `⚠️ Advertencia: Falta el parámetro '${key}' para la URL.`,
        );
      }
    });
  }

  // Procesar queryParams si existen
  if (parametros.queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(parametros.queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const paramsStr = searchParams.toString();
    if (paramsStr) {
      url += url.includes("?") ? `&${paramsStr}` : `?${paramsStr}`;
    }
  }

  return url;
}

export default urlConParametros;
