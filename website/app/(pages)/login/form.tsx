"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BotonLogin, IconifyIcon, TextField, Alert, PasswordField } from "@components";
import { loginAction, ActionState } from "./actions";

const initialState: ActionState = {
  success: false,
  errors: {},
  values: {},
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full">
      {/* Mensajes generales del servidor */}
      {state.message && (
        <Alert
          variant={state.success ? "exito" : "error"}
          title={state.success ? "Éxito" : state.code != null ? `Error ${state.code}` : "Error"}
        >
          {state.message}
        </Alert>
      )}

      {/* Nombre de Usuario */}
      <TextField
        label="Nombre de usuario:"
        name="username"
        defaultValue={state.values?.username || ""}
        errors={state.errors?.username}
        disabled={isPending}
        leftIcon={<IconifyIcon variant="user1" className="text-xl text-primary" />}
        required
      />

      {/* Contraseña */}
      <PasswordField
        label="Contraseña:"
        name="password"
        defaultValue={state.values?.password || ""}
        errors={state.errors?.password}
        disabled={isPending}
        required
      />

      {/* Botón y enlaces */}
      <div className="flex flex-col pt-2 text-end gap-3">
        <BotonLogin type="submit" loading={isPending} disabled={isPending} />
        <a href="#" className="text-foreground-secondary underline text-sm hover:text-foreground transition-colors">
          ¿Olvidaste tu nombre de usuario?
        </a>
        <Link href="/login/recovery-password" className="text-foreground-secondary underline text-sm hover:text-foreground transition-colors">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}
export default LoginForm;