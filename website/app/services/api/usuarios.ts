"use server";

import { RequestSSR } from "../apiClient";
import type { 
  UsuarioResponse, 
  UsuarioPostRequest, 
  UsuarioPutRequest, 
  UsuarioRolesPutRequest,
  PaginatedResponse 
} from "@/models/usuarios";

/**
 * Obtiene la lista de usuarios.
 * Recibe query parameters opcionales (page, limit, search, is_active).
 * NOTA: Para el frontend actual, mandaremos { limit: 9999 } para evadir paginación.
 */
export async function getUsuarios(queryParams?: Record<string, string | number | boolean>) {
  return RequestSSR<PaginatedResponse<UsuarioResponse>>({
    url: "usuarios",
    method: "GET",
    params: { queryParams },
    tags: ["usuarios"],
  });
}

/**
 * Obtiene un usuario por ID.
 */
export async function getUsuario(id: string) {
  return RequestSSR<UsuarioResponse>({
    url: "usuarios/{id}",
    method: "GET",
    params: { id },
    tags: [`usuario-${id}`],
  });
}

/**
 * Crea un nuevo usuario.
 */
export async function postUsuario(data: UsuarioPostRequest) {
  return RequestSSR<UsuarioResponse>({
    url: "usuarios/",
    method: "POST",
    body: data,
  });
}

/**
 * Edita los datos de un usuario.
 */
export async function putUsuario(id: string, data: UsuarioPutRequest) {
  return RequestSSR<UsuarioResponse>({
    url: "usuarios/{id}/",
    method: "PUT",
    params: { id },
    body: data,
  });
}

/**
 * Elimina (o desactiva) un usuario.
 */
export async function deleteUsuario(id: string) {
  return RequestSSR<void>({
    url: "usuarios/{id}/",
    method: "DELETE",
    params: { id },
  });
}

/**
 * Actualiza los roles/permisos de un usuario.
 */
export async function putUsuarioRoles(id: string, data: UsuarioRolesPutRequest) {
  return RequestSSR<void>({
    url: "usuarios/{id}/roles/",
    method: "PUT",
    params: { id },
    body: data,
  });
}
