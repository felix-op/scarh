"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextField, Boton } from "@components";
import { cambiarPasswordAction, ActionState } from "./actions";

interface PasoNuevaPasswordProps {
  token: string;
}

const initialState: ActionState = {
  success: false,
  errors: {},
  values: {},
};

export function PasoNuevaPassword({ token }: PasoNuevaPasswordProps) {
  const [state, formAction, isPending] = useActionState(cambiarPasswordAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const onSkip = () => {
    router.push("/login");
  };

  return (
    <div className="card max-w-md w-full bg-background-paper p-8 rounded-shape-lg border border-border shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-primary">
          Nueva Contraseña
        </h2>
        <p className="text-foreground-secondary text-sm">
          Ingresa tu nueva contraseña para aplicarla a tu cuenta.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
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

        {/* Campo oculto para pasar el token de recuperación a la Server Action */}
        <input type="hidden" name="token" value={token} />

        <TextField
          label="Nueva Contraseña"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Escribe tu nueva contraseña"
          defaultValue={state.values?.password || ""}
          errors={state.errors?.password}
          disabled={isPending || state.success}
          required
          leftIcon={<span className="icon-[mdi--lock-reset] text-lg text-foreground-disabled flex items-center justify-center" />}
          rightAction={{
            icon: (
              <span
                className={
                  showPassword
                    ? "icon-[mdi--eye-off] text-lg"
                    : "icon-[mdi--eye] text-lg"
                }
              />
            ),
            handler: () => setShowPassword((prev) => !prev),
          }}
        />

        <TextField
          label="Repetir Contraseña"
          name="confirm_password"
          type={showPassword ? "text" : "password"}
          placeholder="Repite la nueva contraseña"
          defaultValue={state.values?.confirm_password || ""}
          errors={state.errors?.confirm_password}
          disabled={isPending || state.success}
          required
          leftIcon={<span className="icon-[mdi--lock-check] text-lg text-foreground-disabled flex items-center justify-center" />}
        />

        <Boton
          content={isPending ? "Guardando..." : "Guardar contraseña"}
          type="submit"
          loading={isPending}
          disabled={isPending || state.success}
          variant="primary"
        />

        <Boton
          content="Cancelar recuperación"
          type="button"
          onClick={onSkip}
          disabled={isPending || state.success}
          variant="default"
          outlined
        />
      </form>
    </div>
  );
}

export default PasoNuevaPassword;
