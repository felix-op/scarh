"use server";
import { RequestSSR } from "../../apiClient";
import type { PaginatedHistorialResponse, HistorialResponse, ParamsPaginated } from "@models";

export async function getServerHistorial(params?: ParamsPaginated): Promise<PaginatedHistorialResponse> {
  return RequestSSR<PaginatedHistorialResponse, ParamsPaginated>({
    url: "historial/",
    method: "GET",
    params,
    tags: ["historial"],
  });
}

type GetServerHistorialDetalleOptions = {
  params: {
    id: string;
  };
};

export async function getServerHistorialDetalle({ params }: GetServerHistorialDetalleOptions): Promise<HistorialResponse> {
  return RequestSSR<HistorialResponse, GetServerHistorialDetalleOptions["params"]>({
    url: "historial/{id}/",
    method: "GET",
    params,
    tags: [`historial-${params.id}`],
  });
}
