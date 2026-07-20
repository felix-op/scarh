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

export const usuarioRolesSchema = z.object({
  roles: z.array(z.string()),
});
