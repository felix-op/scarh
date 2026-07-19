"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerLimnigrafos(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "limnigrafos/", method: "GET", params: { queryParams }, tags: ["limnigrafos"] });
}

export async function postServerLimnigrafo(data: any) {
  return RequestSSR<any>({ url: "limnigrafos/", method: "POST", body: data });
}

export async function getServerLimnigrafo(id: string) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/", method: "GET", params: { id }, tags: [`limnigrafo-${id}`] });
}

export async function putServerLimnigrafo(id: string, data: any) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/", method: "PUT", params: { id }, body: data });
}

export async function patchServerLimnigrafo(id: string, data: any) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/", method: "PATCH", params: { id }, body: data });
}

export async function deleteServerLimnigrafo(id: string) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/", method: "DELETE", params: { id } });
}

export async function getServerLimnigrafoConfiguracion(id: string) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/configuracion/", method: "GET", params: { id }, tags: [`limnigrafo-config-${id}`] });
}

export async function putServerLimnigrafoConfiguracion(id: string, data: any) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/configuracion/", method: "PUT", params: { id }, body: data });
}

export async function patchServerLimnigrafoConfiguracion(id: string, data: any) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/configuracion/", method: "PATCH", params: { id }, body: data });
}

export async function postServerLimnigrafoGenerateKey(id: string, data: any) {
  return RequestSSR<any>({ url: "limnigrafos/{id}/generate_key/", method: "POST", params: { id }, body: data });
}
