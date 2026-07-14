import type { Usuario } from "@models";
import { ROLES } from "./constantes-roles";

/**
 * Determina si un listado de roles de usuario incluye el/los rol(es) buscado(s).
 * @property {string[]} rolesUsuario Roles asignados al usuario.
 * @property {string | string[]} rol Rol o lista de roles a verificar (coincidencia con al menos uno).
 */
export function tieneRol(rolesUsuario: string[], rol: string | string[]): boolean {
  if (Array.isArray(rol)) return rol.some((r) => rolesUsuario.includes(r));
  return rolesUsuario.includes(rol);
}

/**
 * Determina si el usuario tiene acceso total de administración.
 * @property {Pick<Usuario, "roles" | "is_superuser">} usuario Usuario a evaluar (roles e is_superuser).
 */
export function esAdmin(usuario: Pick<Usuario, "roles" | "is_superuser">): boolean {
  return usuario.is_superuser || tieneRol(usuario.roles, ROLES.ADMINISTRACION);
}

/**
 * Determina si el usuario puede ver un recurso protegido por un permiso dado.
 * Los administradores (ver `esAdmin`) siempre tienen acceso, sin importar el permiso solicitado.
 * @property {Pick<Usuario, "roles" | "is_superuser">} usuario Usuario a evaluar.
 * @property {string | string[]} [permiso] Permiso o lista de permisos requeridos. Si no se especifica, el acceso es libre.
 */
export function puedeVer(usuario: Pick<Usuario, "roles" | "is_superuser">, permiso?: string | string[]): boolean {
  if (!permiso) return true;
  if (esAdmin(usuario)) return true;
  return tieneRol(usuario.roles, permiso);
}
