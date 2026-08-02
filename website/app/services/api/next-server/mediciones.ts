"use server";
import { RequestSSR } from "../../apiClient";
import type {
  MedicionResponse,
  MedicionPayload,
  PaginatedMedicionResponse,
  ParamsBase,
  ParamsPaginated,
  MedicionImportPayload,
  MedicionImportValidationResponse,
  MedicionBulkImportResponse,
  MedicionSerieQueryParams,
  MedicionSerieResponse,
} from "@models";

/**
 * Serie temporal agrupada para graficar: `GET /medicion/serie/`.
 *
 * El downsampling lo hace el servidor. Los query params van tipados y requeridos
 * porque el backend responde 400 si falta cualquiera.
 */
export async function getSSRMedicionSerie(
  queryParams: MedicionSerieQueryParams
): Promise<MedicionSerieResponse> {
  return RequestSSR<MedicionSerieResponse, ParamsBase>({
    url: "medicion/serie/",
    method: "GET",
    params: { queryParams },
    tags: ["mediciones"],
  });
}

export async function getServerMediciones(params?: ParamsPaginated): Promise<PaginatedMedicionResponse> {
  return RequestSSR<PaginatedMedicionResponse, ParamsPaginated>({
    url: "medicion/",
    method: "GET",
    params,
    tags: ["mediciones"],
  });
}

type PostServerMedicionOptions = {
  data: MedicionPayload;
};

export async function postServerMedicion({ data }: PostServerMedicionOptions): Promise<MedicionResponse> {
  return RequestSSR<MedicionResponse, Record<string, never>, MedicionPayload>({ url: "medicion/", method: "POST", body: data });
}

type GetServerMedicionOptions = {
  params: {
    id: string;
  };
};

export async function getServerMedicion({ params }: GetServerMedicionOptions): Promise<MedicionResponse> {
  return RequestSSR<MedicionResponse, GetServerMedicionOptions["params"]>({
    url: "medicion/{id}/",
    method: "GET",
    params,
    tags: [`medicion-${params.id}`],
  });
}

type PostServerImportMedicionesOptions = {
  data: MedicionImportPayload;
};

export async function postServerValidateImportMediciones({
  data,
}: PostServerImportMedicionesOptions): Promise<MedicionImportValidationResponse> {
  return RequestSSR<MedicionImportValidationResponse, Record<string, never>, MedicionImportPayload>({
    url: "medicion/validate-import/",
    method: "POST",
    body: data,
  });
}

export async function postServerBulkImportMediciones({
  data,
}: PostServerImportMedicionesOptions): Promise<MedicionBulkImportResponse> {
  return RequestSSR<MedicionBulkImportResponse, Record<string, never>, MedicionImportPayload>({
    url: "medicion/bulk-import/",
    method: "POST",
    body: data,
    tags: ["mediciones"],
  });
}
