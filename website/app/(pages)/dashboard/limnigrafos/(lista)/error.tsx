"use client";

import { Alert } from "@components";
import { Boton } from "@components";

export interface LimnigrafoListaErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LimnigrafoListaError({ error, reset }: LimnigrafoListaErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudo cargar la lista de limn\u00edgrafos">
        {error.message || "Ocurri\u00f3 un error inesperado al obtener los limn\u00edgrafos."}
      </Alert>

      <Boton content="Reintentar" onClick={reset} className="self-start" />
    </div>
  );
}
