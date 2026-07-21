"use server";
import { RequestSSR } from "../../apiClient";
import type { RutaAccesoResponse, PaginatedRutaAccesoResponse, ParamsPaginated } from "@models";

export async function getServerRutasAcceso(params?: ParamsPaginated): Promise<PaginatedRutaAccesoResponse> {
  return RequestSSR<PaginatedRutaAccesoResponse, ParamsPaginated>({
    url: "rutas-acceso/",
    method: "GET",
    params,
    tags: ["rutas-acceso"],
  });
}

type PostServerRutaAccesoOptions = {
  data: FormData;
};

export async function postServerRutaAcceso({ data }: PostServerRutaAccesoOptions): Promise<RutaAccesoResponse> {
  return RequestSSR<RutaAccesoResponse, Record<string, never>, FormData>({
    url: "rutas-acceso/",
    method: "POST",
    body: data,
  });
}

type PatchServerRutaAccesoOptions = {
  params: {
    id: string;
  };
  data: FormData;
};

export async function patchServerRutaAcceso({ params, data }: PatchServerRutaAccesoOptions): Promise<RutaAccesoResponse> {
  return RequestSSR<RutaAccesoResponse, PatchServerRutaAccesoOptions["params"], FormData>({
    url: "rutas-acceso/{id}/",
    method: "PATCH",
    params,
    body: data,
  });
}

type DeleteServerRutaAccesoOptions = {
  params: {
    id: string;
  };
};

export async function deleteServerRutaAcceso({ params }: DeleteServerRutaAccesoOptions): Promise<void> {
  return RequestSSR<void, DeleteServerRutaAccesoOptions["params"]>({
    url: "rutas-acceso/{id}/",
    method: "DELETE",
    params,
  });
}

type GetServerRutaAccesoDescargarOptions = {
  params: {
    id: string;
  };
};

export async function getServerRutaAccesoDescargar({ params }: GetServerRutaAccesoDescargarOptions): Promise<Blob> {
  return RequestSSR<Blob, GetServerRutaAccesoDescargarOptions["params"]>({
    url: "rutas-acceso/{id}/descargar/",
    method: "GET",
    params,
    responseType: "blob",
  });
}
