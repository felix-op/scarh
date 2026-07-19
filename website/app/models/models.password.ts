export interface SolicitarRecuperacionPayload {
  email: string;
}

export interface SolicitarRecuperacionResponse {
  detail: string;
}

export interface VerificarCodigoPayload {
  email: string;
  codigo: string;
}

export interface VerificarCodigoResponse {
  access: string;
  refresh: string;
}

export interface CambiarPasswordPayload {
  password: string;
}

export interface CambiarPasswordResponse {
  detail?: string;
}
