"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { TextField, Boton } from "@components";
import { solicitarCodigoAction, ActionState } from "./actions";

interface PasoSolicitarProps {
  onNext: (_email: string) => void;
}

const initialState: ActionState = {
  success: false,
  errors: {},
  values: {},
};

export function PasoSolicitar({ onNext }: PasoSolicitarProps) {
  const [state, formAction, isPending] = useActionState(solicitarCodigoAction, initialState);

  useEffect(() => {
    if (state.success && state.values?.email) {
      const timer = setTimeout(() => {
        onNext(state.values?.email);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.values?.email, onNext]);

  return (
    <div className="card max-w-md w-full bg-background-paper p-8 rounded-shape-lg border border-border shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-primary">
          Recuperar Contraseña
        </h2>
        <p className="text-foreground-secondary text-sm">
          Ingresa tu correo electrónico y te enviaremos un código de validación.
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

        <TextField
          label="Correo Electrónico"
          name="email"
          type="email"
          placeholder="ejemplo@correo.com"
          defaultValue={state.values?.email || ""}
          errors={state.errors?.email}
          disabled={isPending || state.success}
          required
          leftIcon={<span className="icon-[mdi--email] text-lg text-foreground-disabled flex items-center justify-center" />}
        />

        <Boton
          content={isPending ? "Enviando..." : "Solicitar código"}
          type="submit"
          loading={isPending}
          disabled={isPending || state.success}
          variant="primary"
        />

        <div className="flex justify-center text-sm mt-2">
          <Link href="/login" className="text-foreground-secondary hover:text-foreground transition-colors font-medium">
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

export default PasoSolicitar;
