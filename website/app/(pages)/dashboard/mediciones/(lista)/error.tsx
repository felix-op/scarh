"use client";

import { Alert, Boton } from "@components";

export interface MedicionesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MedicionesError({ error, reset }: MedicionesErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudieron cargar las mediciones">
        {error.message || "Ocurrió un error inesperado al obtener las mediciones."}
      </Alert>

      <Boton content="Reintentar" onClick={reset} className="self-start" />
    </div>
  );
}
