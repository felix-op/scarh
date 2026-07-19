"use server";
import { RequestSSR } from "../../apiClient";
import type { EstadisticaResponse, ParamsBase } from "@models";

export async function getServerEstadistica(params?: ParamsBase): Promise<EstadisticaResponse> {
  return RequestSSR<EstadisticaResponse, ParamsBase>({
    url: "estadistica/",
    method: "GET",
    params,
    tags: ["estadistica"],
  });
}
