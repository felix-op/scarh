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
