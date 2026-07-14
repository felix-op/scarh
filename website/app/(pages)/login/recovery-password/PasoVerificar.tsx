"use client";

import React, { useActionState, useEffect, useState } from "react";
import { TextField, Boton } from "@components";
import { verificarCodigoAction, solicitarCodigoAction, ActionState } from "./actions";

interface PasoVerificarProps {
  email: string;
  onNext: (token: string) => void;
  onBack: () => void;
}

const initialState: ActionState = {
  success: false,
  errors: {},
  values: {},
};

export function PasoVerificar({ email, onNext, onBack }: PasoVerificarProps) {
  const [state, formAction, isPending] = useActionState(verificarCodigoAction, initialState);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (state.success && state.accessToken) {
      onNext(state.accessToken);
    }
  }, [state.success, state.accessToken, onNext]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    
    const fd = new FormData();
    fd.append("email", email);
    await solicitarCodigoAction({ success: false }, fd);
    
    setSecondsLeft(10);
  };

  return (
    <div className="card max-w-md w-full bg-background-paper p-8 rounded-shape-lg border border-border shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-primary">
          Código de Verificación
        </h2>
        <p className="text-foreground-secondary text-sm">
          Hemos enviado un código a <strong className="text-foreground">{email}</strong>. Ingresa el código de 6 dígitos a continuación.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.message && (
          <div className="p-3 rounded-shape-sm text-sm font-medium bg-error-light text-error-dark border border-error">
            {state.message}
          </div>
        )}

        {/* Campo oculto para pasar el email a la Server Action */}
        <input type="hidden" name="email" value={email} />

        <TextField
          label="Código"
          name="codigo"
          type="text"
          placeholder="123456"
          maxLength={6}
          defaultValue={state.values?.codigo || ""}
          errors={state.errors?.codigo}
          disabled={isPending || state.success}
          required
          leftIcon={<span className="icon-[mdi--lock-outline] text-lg text-foreground-disabled flex items-center justify-center" />}
        />

        <Boton
          content={secondsLeft > 0 ? `Reenviar código (${secondsLeft}s)` : "Reenviar código"}
          type="button"
          onClick={handleResend}
          disabled={isPending || secondsLeft > 0}
          variant="default"
          outlined
        />

        <Boton
          content={isPending ? "Verificando..." : "Verificar y continuar"}
          type="submit"
          loading={isPending}
          disabled={isPending || state.success}
          variant="primary"
        />

        <Boton
          content="Volver al paso anterior"
          type="button"
          onClick={onBack}
          disabled={isPending}
          variant="default"
          outlined
        />
      </form>
    </div>
  );
}

export default PasoVerificar;
