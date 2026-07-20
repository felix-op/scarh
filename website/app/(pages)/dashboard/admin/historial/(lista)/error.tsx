"use client";

import { Alert, Boton } from "@components";

export interface HistorialErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HistorialError({ error, reset }: HistorialErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudo cargar el historial">
        {error.message || "Ocurrió un error inesperado al obtener el historial de acciones."}
      </Alert>

      <Boton content="Reintentar" onClick={reset} className="self-start" />
    </div>
  );
}
