"use server";
import { RequestSSR } from "../../apiClient";
import type { UbicacionResponse, UbicacionPayload, PaginatedUbicacionResponse, ParamsPaginated } from "@models";

export async function getServerUbicaciones(params?: ParamsPaginated): Promise<PaginatedUbicacionResponse> {
  return RequestSSR<PaginatedUbicacionResponse, ParamsPaginated>({
    url: "ubicacion/",
    method: "GET",
    params,
    tags: ["ubicaciones"],
  });
}

type PostServerUbicacionOptions = {
  data: UbicacionPayload;
};

export async function postServerUbicacion({ data }: PostServerUbicacionOptions): Promise<UbicacionResponse> {
  return RequestSSR<UbicacionResponse, Record<string, never>, UbicacionPayload>({ url: "ubicacion/", method: "POST", body: data });
}

type GetServerUbicacionOptions = {
  params: {
    id: string;
  };
};

export async function getServerUbicacion({ params }: GetServerUbicacionOptions): Promise<UbicacionResponse> {
  return RequestSSR<UbicacionResponse, GetServerUbicacionOptions["params"]>({
    url: "ubicacion/{id}/",
    method: "GET",
    params,
    tags: [`ubicacion-${params.id}`],
  });
}

type PutServerUbicacionOptions = {
  params: {
    id: string;
  };
  data: UbicacionPayload;
};

export async function putServerUbicacion({ params, data }: PutServerUbicacionOptions): Promise<UbicacionResponse> {
  return RequestSSR<UbicacionResponse, PutServerUbicacionOptions["params"], UbicacionPayload>({
    url: "ubicacion/{id}/",
    method: "PUT",
    params,
    body: data,
  });
}

type PatchServerUbicacionOptions = {
  params: {
    id: string;
  };
  data: Partial<UbicacionPayload>;
};

export async function patchServerUbicacion({ params, data }: PatchServerUbicacionOptions): Promise<UbicacionResponse> {
  return RequestSSR<UbicacionResponse, PatchServerUbicacionOptions["params"], Partial<UbicacionPayload>>({
    url: "ubicacion/{id}/",
    method: "PATCH",
    params,
    body: data,
  });
}

type DeleteServerUbicacionOptions = {
  params: {
    id: string;
  };
};

export async function deleteServerUbicacion({ params }: DeleteServerUbicacionOptions): Promise<void> {
  return RequestSSR<void, DeleteServerUbicacionOptions["params"]>({
    url: "ubicacion/{id}/",
    method: "DELETE",
    params,
  });
}
