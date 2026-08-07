"use client";

import { Alert, Boton } from "@components";

export interface AlertasErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AlertasError({ error, reset }: AlertasErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudieron cargar las alertas">
        {error.message || "Ocurrió un error inesperado al obtener las alertas."}
      </Alert>

      <Boton content="Reintentar" onClick={reset} className="self-start" />
    </div>
  );
}
