"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@auth";
import { LoginPayload } from "@models";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  values?: Partial<LoginPayload>;
  message?: string;
  code?: string | number;
};

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      values: rawValues,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            code: 401,
            success: false,
            errors: {
              username: ["Credenciales incorrectas"],
              password: ["Credenciales incorrectas"],
            },
            values: rawValues,
          };
        default:
          return {
            code: 500,
            success: false,
            message: "Ocurrió un error inesperado en el servidor.",
            values: rawValues,
          };
      }
    }

    // signIn lanza un error interno de redirección cuando el login es exitoso: debe propagarse.
    throw error;
  }
}
