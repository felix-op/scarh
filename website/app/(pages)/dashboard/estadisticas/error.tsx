"use client";

import { Alert, Boton } from "@components";

export interface EstadisticasErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Red de contención de la pantalla de estadísticas.
 *
 * Los errores de negocio del cálculo (filtros que el backend rechaza) no llegan
 * hasta acá: la pantalla los muestra en el lugar de la tabla para que se corrijan
 * cambiando un filtro. Esto atrapa lo que sí deja la pantalla inservible — que no
 * se pueda listar la flota de limnígrafos, o un error de render del cliente.
 */
export default function EstadisticasError({ error, reset }: EstadisticasErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="error" title="No se pudo cargar la pantalla de estadísticas">
        {error.message || "Ocurrió un error inesperado al preparar las estadísticas."}
      </Alert>

      <Boton content="Reintentar" icon="restablecer" onClick={reset} className="self-start" />
    </div>
  );
}
