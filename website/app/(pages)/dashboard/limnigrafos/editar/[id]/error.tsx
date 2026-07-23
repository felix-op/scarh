"use client";

import { Alert } from "@components";
import { Boton } from "@components";

export interface EditarLimnigrafoErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EditarLimnigrafoError({ error, reset }: EditarLimnigrafoErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudo cargar el limn\u00edgrafo">
        {error.message || "Ocurri\u00f3 un error inesperado al intentar cargar los datos del limn\u00edgrafo para editar."}
      </Alert>

      <Boton content="Reintentar" onClick={reset} className="self-start" />
    </div>
  );
}
