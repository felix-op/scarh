import { z } from "zod";

export const usuarioPostSchema = z.object({
  nombre_usuario: z.string().min(1, "El nombre de usuario es obligatorio"),
  legajo: z.string().min(1, "El legajo es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  estado: z.boolean(),
  contraseña: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const usuarioPutSchema = z.object({
  nombre_usuario: z.string().min(1, "El nombre de usuario es obligatorio"),
  legajo: z.string().min(1, "El legajo es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
  estado: z.boolean(),
});

/**
 * Campos que el usuario puede editar de sí mismo.
 *
 * No incluye `estado` ni `roles`, que en `usuarioPutSchema` sí están: desde el
 * perfil nadie desactiva su cuenta ni se cambia los permisos. El backend rechaza
 * esos campos igual; el esquema lo hace explícito del lado del formulario.
 */
export const perfilSchema = z.object({
  nombre_usuario: z.string().min(1, "El nombre de usuario es obligatorio"),
  legajo: z.string(),
  email: z.string().email("Correo electrónico inválido"),
  first_name: z.string().min(1, "El nombre es obligatorio"),
  last_name: z.string().min(1, "El apellido es obligatorio"),
});

export const usuarioRolesSchema = z.object({
  roles: z.array(z.string()),
});
