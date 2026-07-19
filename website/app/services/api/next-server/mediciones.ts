"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerMediciones(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "medicion/", method: "GET", params: { queryParams }, tags: ["mediciones"] });
}

export async function postServerMedicion(data: any) {
  return RequestSSR<any>({ url: "medicion/", method: "POST", body: data });
}

export async function getServerMedicion(id: string) {
  return RequestSSR<any>({ url: "medicion/{id}/", method: "GET", params: { id }, tags: [`medicion-${id}`] });
}
