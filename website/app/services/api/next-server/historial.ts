"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerHistorial(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "historial/", method: "GET", params: { queryParams }, tags: ["historial"] });
}

export async function getServerHistorialDetalle(id: string) {
  return RequestSSR<any>({ url: "historial/{id}/", method: "GET", params: { id }, tags: [`historial-${id}`] });
}
