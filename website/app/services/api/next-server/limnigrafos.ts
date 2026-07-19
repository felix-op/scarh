"use server";
import { RequestSSR } from "../../apiClient";
import type { LimnigrafoResponse, LimnigrafoPayload, PaginatedLimnigrafoResponse, ParamsPaginated, ConfiguracionLimnigrafoResponse, ConfiguracionLimnigrafoPayload } from "@models";

export async function getServerLimnigrafos(params?: ParamsPaginated): Promise<PaginatedLimnigrafoResponse> {
  return RequestSSR<PaginatedLimnigrafoResponse, ParamsPaginated>({
    url: "limnigrafos/",
    method: "GET",
    params,
    tags: ["limnigrafos"],
  });
}

type PostServerLimnigrafoOptions = {
  data: LimnigrafoPayload;
};

export async function postServerLimnigrafo({ data }: PostServerLimnigrafoOptions): Promise<LimnigrafoResponse> {
  return RequestSSR<LimnigrafoResponse, Record<string, never>, LimnigrafoPayload>({ url: "limnigrafos/", method: "POST", body: data });
}

type GetServerLimnigrafoOptions = {
  params: {
    id: string;
  };
};

export async function getServerLimnigrafo({ params }: GetServerLimnigrafoOptions): Promise<LimnigrafoResponse> {
  return RequestSSR<LimnigrafoResponse, GetServerLimnigrafoOptions["params"]>({
    url: "limnigrafos/{id}/",
    method: "GET",
    params,
    tags: [`limnigrafo-${params.id}`],
  });
}

type PutServerLimnigrafoOptions = {
  params: {
    id: string;
  };
  data: LimnigrafoPayload;
};

export async function putServerLimnigrafo({ params, data }: PutServerLimnigrafoOptions): Promise<LimnigrafoResponse> {
  return RequestSSR<LimnigrafoResponse, PutServerLimnigrafoOptions["params"], LimnigrafoPayload>({
    url: "limnigrafos/{id}/",
    method: "PUT",
    params,
    body: data,
  });
}

type PatchServerLimnigrafoOptions = {
  params: {
    id: string;
  };
  data: Partial<LimnigrafoPayload>;
};

export async function patchServerLimnigrafo({ params, data }: PatchServerLimnigrafoOptions): Promise<LimnigrafoResponse> {
  return RequestSSR<LimnigrafoResponse, PatchServerLimnigrafoOptions["params"], Partial<LimnigrafoPayload>>({
    url: "limnigrafos/{id}/",
    method: "PATCH",
    params,
    body: data,
  });
}

type DeleteServerLimnigrafoOptions = {
  params: {
    id: string;
  };
};

export async function deleteServerLimnigrafo({ params }: DeleteServerLimnigrafoOptions): Promise<void> {
  return RequestSSR<void, DeleteServerLimnigrafoOptions["params"]>({
    url: "limnigrafos/{id}/",
    method: "DELETE",
    params,
  });
}

type GetServerLimnigrafoConfiguracionOptions = {
  params: {
    id: string;
  };
};

export async function getServerLimnigrafoConfiguracion({ params }: GetServerLimnigrafoConfiguracionOptions): Promise<ConfiguracionLimnigrafoResponse> {
  return RequestSSR<ConfiguracionLimnigrafoResponse, GetServerLimnigrafoConfiguracionOptions["params"]>({
    url: "limnigrafos/{id}/configuracion/",
    method: "GET",
    params,
    tags: [`limnigrafo-config-${params.id}`],
  });
}

type PutServerLimnigrafoConfiguracionOptions = {
  params: {
    id: string;
  };
  data: ConfiguracionLimnigrafoPayload;
};

export async function putServerLimnigrafoConfiguracion({ params, data }: PutServerLimnigrafoConfiguracionOptions): Promise<ConfiguracionLimnigrafoResponse> {
  return RequestSSR<ConfiguracionLimnigrafoResponse, PutServerLimnigrafoConfiguracionOptions["params"], ConfiguracionLimnigrafoPayload>({
    url: "limnigrafos/{id}/configuracion/",
    method: "PUT",
    params,
    body: data,
  });
}

type PatchServerLimnigrafoConfiguracionOptions = {
  params: {
    id: string;
  };
  data: Partial<ConfiguracionLimnigrafoPayload>;
};

export async function patchServerLimnigrafoConfiguracion({ params, data }: PatchServerLimnigrafoConfiguracionOptions): Promise<ConfiguracionLimnigrafoResponse> {
  return RequestSSR<ConfiguracionLimnigrafoResponse, PatchServerLimnigrafoConfiguracionOptions["params"], Partial<ConfiguracionLimnigrafoPayload>>({
    url: "limnigrafos/{id}/configuracion/",
    method: "PATCH",
    params,
    body: data,
  });
}

type PostServerLimnigrafoGenerateKeyOptions = {
  params: {
    id: string;
  };
  data: Record<string, never>;
};

export async function postServerLimnigrafoGenerateKey({ params, data }: PostServerLimnigrafoGenerateKeyOptions): Promise<LimnigrafoResponse> {
  return RequestSSR<LimnigrafoResponse, PostServerLimnigrafoGenerateKeyOptions["params"], Record<string, never>>({
    url: "limnigrafos/{id}/generate_key/",
    method: "POST",
    params,
    body: data,
  });
}
