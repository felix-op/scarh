"use server";
import { RequestSSR } from "../../apiClient";
import type { EstadisticaTablaQueryParams, EstadisticaTablaResponse, ParamsBase } from "@models";

/**
 * Tabla de estadísticas descriptivas: `GET /estadisticas/tabla/`.
 *
 * Los query params van tipados y requeridos porque el backend responde 400 si
 * falta cualquiera; es preferible que el error salte al compilar y no en runtime.
 */
export async function getSSREstadisticasTabla(
  queryParams: EstadisticaTablaQueryParams
): Promise<EstadisticaTablaResponse> {
  return RequestSSR<EstadisticaTablaResponse, ParamsBase>({
    url: "estadisticas/tabla/",
    method: "GET",
    params: { queryParams },
    tags: ["estadistica"],
  });
}
