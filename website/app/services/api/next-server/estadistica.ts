"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerEstadistica(queryParams?: Record<string, any>) {
  return RequestSSR<any>({ url: "estadistica/", method: "GET", params: { queryParams }, tags: ["estadistica"] });
}
