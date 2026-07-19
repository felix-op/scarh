"use server";
import { RequestSSR } from "../../apiClient";

export async function postServerAuthLogin(data: any) {
  return RequestSSR<any>({ url: "auth/login/", method: "POST", body: data });
}

export async function postServerAuthLogout() {
  return RequestSSR<any>({ url: "auth/logout/", method: "POST" });
}

export async function postServerAuthRecuperarPasswordNueva(data: any) {
  return RequestSSR<any>({ url: "auth/recuperar-password/nueva/", method: "POST", body: data });
}

export async function postServerAuthRecuperarPasswordSolicitar(data: any) {
  return RequestSSR<any>({ url: "auth/recuperar-password/solicitar/", method: "POST", body: data });
}

export async function postServerAuthRecuperarPasswordValidar(data: any) {
  return RequestSSR<any>({ url: "auth/recuperar-password/validar/", method: "POST", body: data });
}

export async function postServerAuthRefresh(data: any) {
  return RequestSSR<any>({ url: "auth/refresh/", method: "POST", body: data });
}
