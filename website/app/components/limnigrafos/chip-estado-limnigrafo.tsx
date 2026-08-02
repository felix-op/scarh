import { Chip, type ChipSize } from "../ui/chip";
import { ChipEstado } from "../ui/chip-estado";
import { tieneCoberturaAlertas } from "@utils";
import type { EstadoLimnigrafoVariant } from "@utils";

export interface ChipEstadoConexionProps {
  estado: string;
  tipoComunicacion: string[];
  size?: ChipSize;
}

/** Chip para el estado de la conexión (en línea, demorado, sin conexión). */
export function ChipEstadoConexion({ estado, tipoComunicacion, size = "sm" }: ChipEstadoConexionProps) {
  const tieneAlertas = tieneCoberturaAlertas(tipoComunicacion);
  let variant: EstadoLimnigrafoVariant = "none";
  let label = estado;

  if (estado === "en_linea") {
    variant = "success";
    label = "En línea";
  } else if (estado === "demorado") {
    variant = "warn";
    label = "Demorado";
  } else if (estado === "sin_conexion") {
    label = "Sin conexión";
    // Si NO tiene cobertura para alertas, no es grave estar sin conexión (gris/none)
    // Si SÍ tiene cobertura, es un error (rojo/error)
    variant = tieneAlertas ? "error" : "none";
  }

  return (
    <Chip variant={variant} size={size}>
      {label}
    </Chip>
  );
}

export interface ChipEstadoMedicionProps {
  estado: string;
  size?: ChipSize;
}

/** Chip para el estado de la última medición (normal, fuera de rango). */
export function ChipEstadoMedicion({ estado, size = "sm" }: ChipEstadoMedicionProps) {
  let variant: EstadoLimnigrafoVariant = "none";
  let label = estado;

  if (estado === "normal") {
    variant = "success";
    label = "Normal";
  } else if (estado === "fuera_de_rango") {
    variant = "warn";
    label = "Fuera de rango";
  }

  return (
    <Chip variant={variant} size={size}>
      {label}
    </Chip>
  );
}

/* -------------------------------------------------------------------------- */
/* Estado unificado                                                           */
/* -------------------------------------------------------------------------- */

export interface ChipEstadoLimnigrafoProps {
  estadoConexion: string;
  estadoMedicion: string;
  tipoComunicacion: string[];
  size?: ChipSize;
  anchoFijo?: boolean;
}

/**
 * Estado del limnígrafo en **una sola** pastilla.
 *
 * Antes se mostraban dos chips, conexión y medición, y juntos confundían: un equipo
 * podía decir "Sin conexión" y "Normal" a la vez, donde ese "Normal" describe una
 * medición de hace tres días. Acá se resuelve por precedencia y se muestra lo más
 * urgente, que es lo que uno necesita saber de un vistazo.
 *
 * **Los equipos sin enlace remoto no tienen estado de conexión.** Un limnígrafo que
 * sólo se descarga por USB está permanentemente "sin conexión", y mostrarlo como
 * falla sería un falso positivo constante: no es que se cayó, es que nunca
 * transmite. Para esos la pastilla dice que no envía datos, en gris, sin alarma.
 *
 * Orden de precedencia:
 * 1. Sin enlace remoto → *Sin envío de datos*, salvo que la última medición esté
 *    fuera de rango: eso sí importa aunque los datos se hayan cargado a mano.
 * 2. Con enlace remoto, primero el estado de conexión —si no está reportando, la
 *    medición que hay es vieja y hablar de ella induce a error— y después el de la
 *    medición.
 */
export function ChipEstadoLimnigrafo({
  estadoConexion,
  estadoMedicion,
  tipoComunicacion,
  size = "md",
  anchoFijo = false,
}: ChipEstadoLimnigrafoProps) {
  const comun = { size, anchoFijo };
  const fueraDeRango = estadoMedicion === "fuera_de_rango";

  if (!tieneCoberturaAlertas(tipoComunicacion)) {
    return fueraDeRango ? (
      <ChipEstado etiqueta="Fuera de rango" variante="warn" {...comun} />
    ) : (
      <ChipEstado etiqueta="Sin envío de datos" variante="neutral" {...comun} />
    );
  }

  if (estadoConexion === "sin_conexion") {
    return <ChipEstado etiqueta="Sin conexión" variante="error" {...comun} />;
  }
  if (estadoConexion === "demorado") {
    return <ChipEstado etiqueta="Demorado" variante="warn" {...comun} />;
  }
  if (fueraDeRango) {
    return <ChipEstado etiqueta="Fuera de rango" variante="warn" {...comun} />;
  }

  return <ChipEstado etiqueta="En línea" variante="success" {...comun} />;
}
