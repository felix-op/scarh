"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerUbicaciones(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "ubicacion/", method: "GET", params: { queryParams }, tags: ["ubicaciones"] });
}

export async function postServerUbicacion(data: any) {
  return RequestSSR<any>({ url: "ubicacion/", method: "POST", body: data });
}

export async function getServerUbicacion(id: string) {
  return RequestSSR<any>({ url: "ubicacion/{id}/", method: "GET", params: { id }, tags: [`ubicacion-${id}`] });
}

export async function putServerUbicacion(id: string, data: any) {
  return RequestSSR<any>({ url: "ubicacion/{id}/", method: "PUT", params: { id }, body: data });
}

export async function patchServerUbicacion(id: string, data: any) {
  return RequestSSR<any>({ url: "ubicacion/{id}/", method: "PATCH", params: { id }, body: data });
}

export async function deleteServerUbicacion(id: string) {
  return RequestSSR<any>({ url: "ubicacion/{id}/", method: "DELETE", params: { id } });
}
