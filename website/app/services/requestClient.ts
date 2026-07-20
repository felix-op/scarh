import axios from 'axios';
import { urlConParametros } from '@utils';
import type { ParamsBase } from '@models';

const axiosInstance = axios.create({
  baseURL: '/api/', // Apunta a las rutas de Next.js (por ej. /api/usuarios)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para extraer automáticamente la data o arrojar el error limpio
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Intentamos extraer el mensaje de error que nos envíe nuestra API de Next
    const message = error.response?.data?.error || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  }
);

/**
 * Cliente HTTP ligero basado en Axios para ser usado desde los Server/Client Components
 * hacia nuestras propias Route Handlers (/api/...) de Next.js.
 */
export interface RequestClientOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: TBody;
  headers?: Record<string, string>;
  token?: string;
}

export async function RequestClient<TResponse, TParams extends ParamsBase = ParamsBase, TBody = unknown>(
  url: string,
  params?: TParams,
  options: RequestClientOptions<TBody> = {}
): Promise<TResponse> {
  let processedUrl = url;

  if (params && Object.keys(params).length > 0) {
    processedUrl = urlConParametros(url, params);
  }

  const reqHeaders: Record<string, string> = { ...options.headers };
  if (options.token) {
    reqHeaders['Authorization'] = `Bearer ${options.token}`;
  }

  return axiosInstance.request<TResponse, TResponse>({ 
    url: processedUrl, 
    method: options.method || "GET",
    data: options.data,
    headers: reqHeaders 
  });
}

export default RequestClient;
