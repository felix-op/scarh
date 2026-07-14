import { RequestSSR } from "../apiClient";

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
  accessToken: string;
  refreshToken: string;
}

export interface CambiarPasswordPayload {
  password: string;
}

export interface CambiarPasswordResponse {
  detail?: string;
}

/**
 * Solicita el código de recuperación de contraseña enviando un correo al usuario.
 * @param email Correo electrónico de la cuenta a recuperar.
 */
export async function solicitarRecuperacion(email: string): Promise<SolicitarRecuperacionResponse> {
  return RequestSSR<SolicitarRecuperacionResponse, any, SolicitarRecuperacionPayload>(
    "/auth/recuperar-password/solicitar",
    {
      method: "POST",
      body: { email },
      token: "",
    }
  );
}

/**
 * Verifica el código de recuperación enviado por correo electrónico.
 * @param email Correo electrónico de la cuenta.
 * @param codigo Código de verificación de 6 dígitos.
 */
export async function verificarCodigo(email: string, codigo: string): Promise<VerificarCodigoResponse> {
  return RequestSSR<VerificarCodigoResponse, any, VerificarCodigoPayload>(
    "/auth/recuperar-password/validar/",
    {
      method: "POST",
      body: { email, codigo },
      token: "",
    }
  );
}

/**
 * Modifica la contraseña utilizando el token temporal obtenido en el paso de verificación.
 * @param password Nueva contraseña elegida por el usuario.
 * @param token Token de acceso de recuperación temporal.
 */
export async function cambiarPasswordRecuperada(password: string, token: string): Promise<CambiarPasswordResponse> {
  return RequestSSR<CambiarPasswordResponse, any, CambiarPasswordPayload>(
    "/auth/recuperar-password/nueva/",
    {
      method: "POST",
      body: { password },
      token,
    }
  );
}
