"use server";
import { RequestSSR } from "../../apiClient";

export interface UsuarioPostRequest {
  [key: string]: any;
}
export interface UsuarioPutRequest {
  [key: string]: any;
}
export interface UsuarioRolesPutRequest {
  [key: string]: any;
}

export async function getServerUsuarios(queryParams?: Record<string, string | number | boolean>) {
  return RequestSSR<any>({ url: "usuarios/", method: "GET", params: { queryParams }, tags: ["usuarios"] });
}

export async function postServerUsuario(data: UsuarioPostRequest) {
  return RequestSSR<any>({ url: "usuarios/", method: "POST", body: data });
}

export async function getServerUsuario(id: string) {
  return RequestSSR<any>({ url: "usuarios/{id}/", method: "GET", params: { id }, tags: [`usuario-${id}`] });
}

export async function putServerUsuario(id: string, data: UsuarioPutRequest) {
  return RequestSSR<any>({ url: "usuarios/{id}/", method: "PUT", params: { id }, body: data });
}

export async function patchServerUsuario(id: string, data: any) {
  return RequestSSR<any>({ url: "usuarios/{id}/", method: "PATCH", params: { id }, body: data });
}

export async function deleteServerUsuario(id: string) {
  return RequestSSR<any>({ url: "usuarios/{id}/", method: "DELETE", params: { id } });
}

export async function postServerUsuarioCambiarPassword(id: string, data: any) {
  return RequestSSR<any>({ url: "usuarios/{id}/cambiar-password/", method: "POST", params: { id }, body: data });
}

export async function putServerUsuarioRoles(id: string, data: UsuarioRolesPutRequest) {
  return RequestSSR<any>({ url: "usuarios/{id}/roles/", method: "PUT", params: { id }, body: data });
}
