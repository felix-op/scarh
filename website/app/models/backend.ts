export interface BackendError {
  codigo: number;
  descripcion_tecnica: string;
  descripcion_usuario: string;
  titulo: string;
}

export class ApiError extends Error {
  public codigo: string | number;
  public descripcionUsuario: string;
  public descripcionTecnica: string;

  constructor(codigo: string | number, descripcionUsuario: string, descripcionTecnica: string) {
    super(descripcionUsuario);
    this.name = "ApiError";
    this.codigo = codigo;
    this.descripcionUsuario = descripcionUsuario;
    this.descripcionTecnica = descripcionTecnica;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type TQueryParams = Record<string, string | number | boolean>;

export type TPaginatedQueryParams = TQueryParams & {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
};

export type ParamsBase = {
  [key: string]: string | number | boolean | Record<string, unknown> | undefined;
  queryParams?: TQueryParams;
};

export type ParamsPaginated = {
  [key: string]: string | number | boolean | Record<string, unknown> | undefined;
  queryParams?: TPaginatedQueryParams;
}
