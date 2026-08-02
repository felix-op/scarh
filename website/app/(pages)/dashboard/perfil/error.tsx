"use client";

import { Alert, Boton } from "@components";

export default function PerfilError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Alert variant="error" title="No se pudo cargar tu perfil">
        {error.message || "Ocurrió un error inesperado al obtener tus datos."}
      </Alert>
      <Boton content="Reintentar" icon="restablecer" onClick={reset} className="self-start" />
    </div>
  );
}
