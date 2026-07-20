"use server";

import { z } from "zod";
import { postServerAuthRecuperarPasswordSolicitar, postServerAuthRecuperarPasswordValidar, postServerAuthRecuperarPasswordNueva } from "@services";
import { ApiError } from "@models";

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  values?: Record<string, any>;
  message?: string;
  accessToken?: string;
  code?: string | number;
};

const emailSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
});

const codeSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  codigo: z.string().length(6, "El código debe tener exactamente 6 dígitos"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirm_password: z.string(),
  token: z.string().min(1, "El token de recuperación es requerido"),
}).refine(data => data.password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

export async function solicitarCodigoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") ? String(formData.get("email")) : "";
  const values = { email };

  const validation = emailSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const res = await postServerAuthRecuperarPasswordSolicitar({ data: { email } });
    return {
      success: true,
      message: res.detail || "Se ha enviado un código a tu correo.",
      values,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.descripcionUsuario,
        code: err.codigo,
        values,
      };
    }
    return {
      success: false,
      message: "No se pudo procesar la solicitud.",
      values,
    };
  }
}

export async function verificarCodigoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") ? String(formData.get("email")) : "";
  const codigo = formData.get("codigo") ? String(formData.get("codigo")) : "";
  const values = { email, codigo };

  const validation = codeSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const res = await postServerAuthRecuperarPasswordValidar({ data: { email, codigo } });
    return {
      success: true,
      accessToken: res.access,
      values,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.descripcionUsuario,
        code: err.codigo,
        values,
      };
    }
    return {
      success: false,
      message: "Código inválido o expirado.",
      values,
    };
  }
}

export async function cambiarPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = formData.get("password") ? String(formData.get("password")) : "";
  const confirm_password = formData.get("confirm_password") ? String(formData.get("confirm_password")) : "";
  const token = formData.get("token") ? String(formData.get("token")) : "";
  const values = { password, confirm_password, token };

  const validation = passwordSchema.safeParse(values);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await postServerAuthRecuperarPasswordNueva({ data: { password }, token });
    return {
      success: true,
      message: "Contraseña actualizada con éxito.",
      values,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        message: err.descripcionUsuario,
        values,
      };
    }
    return {
      success: false,
      message: "Ocurrió un error al actualizar la contraseña.",
      values,
    };
  }
}
