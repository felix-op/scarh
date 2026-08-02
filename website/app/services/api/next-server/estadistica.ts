"use server";
import { RequestSSR } from "../../apiClient";
import type {
  DashboardResponse,
  EstadisticaTablaQueryParams,
  EstadisticaTablaResponse,
  ParamsBase,
} from "@models";

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

/**
 * Panorama de la instalación para la pantalla de inicio: `GET /estadisticas/dashboard/`.
 *
 * Pide sesión pero ningún rol, así que lo puede consumir cualquier usuario del
 * sistema aunque no tenga permisos de estadísticas.
 */
export async function getSSREstadisticasDashboard(): Promise<DashboardResponse> {
  return RequestSSR<DashboardResponse>({
    url: "estadisticas/dashboard/",
    method: "GET",
    tags: ["estadistica", "mediciones", "limnigrafos"],
  });
}
