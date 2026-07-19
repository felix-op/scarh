"use server";
import { RequestSSR } from "../../apiClient";
import type { 
  UsuarioResponse, 
  UsuarioPostRequest, 
  UsuarioPutRequest, 
  UsuarioRolesPutRequest, 
  PaginatedResponse,
  ParamsPaginated,
} from "@models";

export async function getServerUsuarios(params?: ParamsPaginated): Promise<PaginatedResponse<UsuarioResponse>> {
  return RequestSSR<PaginatedResponse<UsuarioResponse>, ParamsPaginated>({
    url: "usuarios/",
    method: "GET",
    params,
    tags: ["usuarios"],
  });
}

type PostServerUsuarioOptions = {
  data: UsuarioPostRequest;
};

export async function postServerUsuario({ data }: PostServerUsuarioOptions): Promise<UsuarioResponse> {
  return RequestSSR<UsuarioResponse, Record<string, never>, UsuarioPostRequest>({ url: "usuarios/", method: "POST", body: data });
}

type GetServerUsuarioOptions = {
  params: {
    id: string;
  };
};

export async function getServerUsuario({ params }: GetServerUsuarioOptions): Promise<UsuarioResponse> {
  return RequestSSR<UsuarioResponse, GetServerUsuarioOptions["params"]>({
    url: "usuarios/{id}/",
    method: "GET",
    params,
    tags: [`usuario-${params.id}`],
  });
}

type PutServerUsuarioOptions = {
  params: {
    id: string;
  };
  data: UsuarioPutRequest;
};

export async function putServerUsuario({ params, data }: PutServerUsuarioOptions): Promise<UsuarioResponse> {
  return RequestSSR<UsuarioResponse, PutServerUsuarioOptions["params"], UsuarioPutRequest>({
    url: "usuarios/{id}/",
    method: "PUT",
    params,
    body: data,
  });
}

type PatchServerUsuarioOptions = {
  params: {
    id: string;
  };
  data: Partial<UsuarioPutRequest>;
};

export async function patchServerUsuario({ params, data }: PatchServerUsuarioOptions): Promise<UsuarioResponse> {
  return RequestSSR<UsuarioResponse, PatchServerUsuarioOptions["params"], Partial<UsuarioPutRequest>>({
    url: "usuarios/{id}/",
    method: "PATCH",
    params,
    body: data,
  });
}

type DeleteServerUsuarioOptions = {
  params: {
    id: string;
  };
};

export async function deleteServerUsuario({ params }: DeleteServerUsuarioOptions): Promise<void> {
  return RequestSSR<void, DeleteServerUsuarioOptions["params"]>({
    url: "usuarios/{id}/",
    method: "DELETE",
    params,
  });
}

type PostServerUsuarioCambiarPasswordOptions = {
  params: {
    id: string;
  };
  data: Record<string, unknown>;
};

export async function postServerUsuarioCambiarPassword({ params, data }: PostServerUsuarioCambiarPasswordOptions): Promise<Record<string, unknown>> {
  return RequestSSR<Record<string, unknown>, PostServerUsuarioCambiarPasswordOptions["params"], Record<string, unknown>>({
    url: "usuarios/{id}/cambiar-password/",
    method: "POST",
    params,
    body: data,
  });
}

type PutServerUsuarioRolesOptions = {
  params: {
    id: string;
  };
  data: UsuarioRolesPutRequest;
};

export async function putServerUsuarioRoles({ params, data }: PutServerUsuarioRolesOptions): Promise<UsuarioResponse> {
  return RequestSSR<UsuarioResponse, PutServerUsuarioRolesOptions["params"], UsuarioRolesPutRequest>({
    url: "usuarios/{id}/roles/",
    method: "PUT",
    params,
    body: data,
  });
}
