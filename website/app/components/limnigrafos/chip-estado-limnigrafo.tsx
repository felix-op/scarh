import { Chip, type ChipSize } from "../ui/chip";
import { ESTADO_LIMNIGRAFO } from "@utils";

export interface ChipEstadoLimnigrafoProps {
  estado: string;
  size?: ChipSize;
}

/** Chip de estado del limnígrafo (normal / advertencia / peligro / fuera de rango). */
export function ChipEstadoLimnigrafo({ estado, size = "sm" }: ChipEstadoLimnigrafoProps) {
  const config = ESTADO_LIMNIGRAFO[estado] ?? { label: estado || "Desconocido", variant: "none" as const };
  return (
    <Chip variant={config.variant} size={size}>
      {config.label}
    </Chip>
  );
}

export default ChipEstadoLimnigrafo;
