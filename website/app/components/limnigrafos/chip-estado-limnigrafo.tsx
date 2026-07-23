import { Chip, type ChipSize } from "../ui/chip";
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
