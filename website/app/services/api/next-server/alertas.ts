"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerAlertas(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "alertas/", method: "GET", params: { queryParams }, tags: ["alertas"] });
}

export async function getServerAlerta(id: string) {
  return RequestSSR<any>({ url: "alertas/{id}/", method: "GET", params: { id }, tags: [`alerta-${id}`] });
}

export async function putServerAlerta(id: string, data: any) {
  return RequestSSR<any>({ url: "alertas/{id}/", method: "PUT", params: { id }, body: data });
}

export async function patchServerAlerta(id: string, data: any) {
  return RequestSSR<any>({ url: "alertas/{id}/", method: "PATCH", params: { id }, body: data });
}
