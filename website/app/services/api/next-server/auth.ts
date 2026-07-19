"use server";
import { RequestSSR } from "../../apiClient";
import type {
  SolicitarRecuperacionPayload,
  SolicitarRecuperacionResponse,
  VerificarCodigoPayload,
  VerificarCodigoResponse,
  CambiarPasswordPayload,
  CambiarPasswordResponse,
  ParamsBase
} from "@models";

// No hace falta endpoints para la autenticación
// type PostServerAuthLoginOptions = {
//   data: Record<string, unknown>;
// };

// export async function postServerAuthLogin({ data }: PostServerAuthLoginOptions) {
//   return RequestSSR<Record<string, unknown>, ParamsBase, Record<string, unknown>>({ url: "auth/login/", method: "POST", body: data });
// }

// export async function postServerAuthLogout() {
//   return RequestSSR<Record<string, unknown>, ParamsBase>({ url: "auth/logout/", method: "POST" });
// }

// type PostServerAuthRefreshOptions = {
//   data: Record<string, unknown>;
// };

// export async function postServerAuthRefresh({ data }: PostServerAuthRefreshOptions) {
//   return RequestSSR<Record<string, unknown>, ParamsBase, Record<string, unknown>>({ url: "auth/refresh/", method: "POST", body: data });
// }

type PostServerAuthRecuperarPasswordNuevaOptions = {
  data: CambiarPasswordPayload;
  token: string;
};

/**
 * Modifica la contraseña utilizando el token temporal obtenido en el paso de verificación.
 */
export async function postServerAuthRecuperarPasswordNueva({ data, token }: PostServerAuthRecuperarPasswordNuevaOptions): Promise<CambiarPasswordResponse> {
  return RequestSSR<CambiarPasswordResponse, ParamsBase, CambiarPasswordPayload>({
    url: "auth/recuperar-password/nueva/",
    method: "POST",
    body: data,
    token,
  });
}

type PostServerAuthRecuperarPasswordSolicitarOptions = {
  data: SolicitarRecuperacionPayload;
};

/**
 * Solicita el código de recuperación de contraseña enviando un correo al usuario.
 */
export async function postServerAuthRecuperarPasswordSolicitar({ data }: PostServerAuthRecuperarPasswordSolicitarOptions): Promise<SolicitarRecuperacionResponse> {
  return RequestSSR<SolicitarRecuperacionResponse, ParamsBase, SolicitarRecuperacionPayload>({
    url: "auth/recuperar-password/solicitar",
    method: "POST",
    body: data,
    token: "",
  });
}

type PostServerAuthRecuperarPasswordValidarOptions = {
  data: VerificarCodigoPayload;
};

/**
 * Verifica el código de recuperación enviado por correo electrónico.
 */
export async function postServerAuthRecuperarPasswordValidar({ data }: PostServerAuthRecuperarPasswordValidarOptions): Promise<VerificarCodigoResponse> {
  return RequestSSR<VerificarCodigoResponse, ParamsBase, VerificarCodigoPayload>({
    url: "auth/recuperar-password/validar",
    method: "POST",
    body: data,
    token: "",
  });
}
