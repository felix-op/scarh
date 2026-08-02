/**
 * Usuario autenticado, tal como lo devuelve el login de Django y se persiste en la sesión.
 * @property {number} id Identificador interno del usuario.
 * @property {string} username Nombre de usuario.
 * @property {string} email Correo electrónico.
 * @property {string} first_name Nombre de pila.
 * @property {string} last_name Apellido.
 * @property {boolean} is_superuser Superusuario de Django (acceso total).
 * @property {boolean} is_staff Usuario de staff de Django.
 * @property {string[]} roles Roles/permisos asignados al usuario.
 */
export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_staff: boolean;
  roles: string[];
}

export type EstadoUsuario = "activo" | "inactivo";

export type UsuarioResponse = {
  id: number;
  nombre_usuario: string;
  legajo: string;
  email: string;
  first_name: string;
  last_name: string;
  estado: boolean;
  roles: string[];
};

export type UsuarioPostRequest = {
  nombre_usuario: string;
  legajo: string;
  email: string;
  first_name: string;
  last_name: string;
  estado: boolean;
  contraseña: string;
};

export type UsuarioPutRequest = {
  nombre_usuario: string;
  legajo: string;
  email: string;
  first_name: string;
  last_name: string;
  estado: boolean;
};

export type UsuarioRolesPutRequest = {
  roles: string[];
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Datos propios del usuario autenticado (`GET /usuarios/me/`).
 *
 * `estado` y `roles` vienen para mostrarlos pero son de sólo lectura: cambiarlos
 * sigue siendo tarea de la administración de usuarios.
 *
 * @property {number} id Identificador del usuario.
 * @property {string} nombre_usuario Nombre de usuario.
 * @property {string | null} legajo Legajo administrativo.
 * @property {string} email Correo electrónico.
 * @property {string} first_name Nombre.
 * @property {string} last_name Apellido.
 * @property {boolean} estado Si la cuenta está activa.
 * @property {string[]} roles Roles asignados.
 */
export interface PerfilResponse {
  id: number;
  nombre_usuario: string;
  legajo: string | null;
  email: string;
  first_name: string;
  last_name: string;
  estado: boolean;
  roles: string[];
}

/**
 * Campos que el usuario puede editar de sí mismo. La contraseña, el estado y los
 * roles quedan fuera a propósito; el backend los rechaza.
 */
export type PerfilPayload = Pick<
  PerfilResponse,
  "nombre_usuario" | "email" | "first_name" | "last_name"
> & { legajo?: string | null };
