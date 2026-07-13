"use server";

import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  values?: Record<string, any>;
  message?: string;
};

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Simulamos un retraso para ver el estado de carga (isPending)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const rawUsername = formData.get("username");
  const rawPassword = formData.get("password");

  const rawValues = {
    username: rawUsername ? String(rawUsername) : "",
    password: rawPassword ? String(rawPassword) : "",
  };

  const validation = loginSchema.safeParse(rawValues);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: rawValues,
    };
  }

  const { username, password } = validation.data;

  try {
    // Simulación de credenciales de ejemplo
    if (username === "admin" && password === "password123") {
      return {
        success: true,
        message: "Inicio de sesión exitoso",
        values: rawValues,
      };
    }

    return {
      success: false,
      errors: {
        username: ["Credenciales incorrectas"],
        password: ["Credenciales incorrectas"],
      },
      values: rawValues,
    };
  } catch (error) {
    return {
      success: false,
      message: "Ocurrió un error inesperado en el servidor.",
      values: rawValues,
    };
  }
}
