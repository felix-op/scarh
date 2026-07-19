"use server";
import { RequestSSR } from "../../apiClient";
import type { AlertaResponse, AlertaPayload, PaginatedAlertaResponse, ParamsPaginated } from "@models";

export async function getServerAlertas(params?: ParamsPaginated): Promise<PaginatedAlertaResponse> {
  return RequestSSR<PaginatedAlertaResponse, ParamsPaginated>({
    url: "alertas/",
    method: "GET",
    params,
    tags: ["alertas"],
  });
}

type GetServerAlertaOptions = {
  params: {
    id: string;
  };
};

export async function getServerAlerta({ params }: GetServerAlertaOptions): Promise<AlertaResponse> {
  return RequestSSR<AlertaResponse, GetServerAlertaOptions["params"]>({
    url: "alertas/{id}/",
    method: "GET",
    params,
    tags: [`alerta-${params.id}`],
  });
}

type PutServerAlertaOptions = {
  params: {
    id: string;
  };
  data: AlertaPayload;
};

export async function putServerAlerta({ params, data }: PutServerAlertaOptions): Promise<AlertaResponse> {
  return RequestSSR<AlertaResponse, PutServerAlertaOptions["params"], AlertaPayload>({
    url: "alertas/{id}/",
    method: "PUT",
    params,
    body: data,
  });
}

type PatchServerAlertaOptions = {
  params: {
    id: string;
  };
  data: Partial<AlertaPayload>;
};

export async function patchServerAlerta({ params, data }: PatchServerAlertaOptions): Promise<AlertaResponse> {
  return RequestSSR<AlertaResponse, PatchServerAlertaOptions["params"], Partial<AlertaPayload>>({
    url: "alertas/{id}/",
    method: "PATCH",
    params,
    body: data,
  });
}
