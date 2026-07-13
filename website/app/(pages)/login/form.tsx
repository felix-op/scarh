"use client";

import { useActionState } from "react";
import { BotonLogin, IconifyIcon, TextField } from "@components";
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
        <div
          className={`p-3 rounded-shape-sm text-sm font-medium ${
            state.success
              ? "bg-success-light text-success-dark border border-success"
              : "bg-error-light text-error-dark border border-error"
          }`}
        >
          {state.message}
        </div>
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
      <TextField
        label="Contraseña:"
        name="password"
        type="password"
        defaultValue={state.values?.password || ""}
        errors={state.errors?.password}
        disabled={isPending}
        leftIcon={<IconifyIcon variant="perfilPassword" className="text-xl text-primary" />}
        required
      />

      {/* Botón y enlaces */}
      <div className="flex flex-col pt-2 text-end gap-3">
        <BotonLogin type="submit" loading={isPending} disabled={isPending} />
        <a href="#" className="text-foreground-secondary underline text-sm hover:text-foreground transition-colors">
          ¿Olvidaste tu nombre de usuario?
        </a>
        <a href="#" className="text-foreground-secondary underline text-sm hover:text-foreground transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
}
export default LoginForm;