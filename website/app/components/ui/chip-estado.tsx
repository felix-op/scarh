import type { ChipSize } from "./chip";

/**
 * Variantes de estado. Son los colores **reservados** del sistema: se usan cuando
 * el color significa bien/atención/problema, nunca como identidad de una serie.
 */
export type ChipEstadoVariante = "success" | "warn" | "error" | "neutral";

const COLOR_PUNTO: Record<ChipEstadoVariante, string> = {
  success: "bg-success",
  warn: "bg-warn",
  error: "bg-error",
  neutral: "bg-foreground-disabled",
};

const TAMANIOS: Record<ChipSize, { pastilla: string; aro: string; punto: string; texto: string }> = {
  sm: { pastilla: "px-2 py-1 gap-1.5", aro: "size-5", punto: "size-3", texto: "text-xs" },
  md: { pastilla: "px-3 py-1.5 gap-2", aro: "size-7", punto: "size-4", texto: "text-sm" },
  lg: { pastilla: "px-3.5 py-2 gap-2.5", aro: "size-8", punto: "size-5", texto: "text-base" },
};

/**
 * Pastilla de estado con punto de color destacado.
 *
 * Es la versión de presentación, para tarjetas y fichas donde el estado es el dato
 * principal. Convive con `Chip`, que es plano y compacto y sigue siendo el correcto
 * para filtros y listados densos: este ocupa bastante más y ahí sería ruido.
 *
 * El color va en el punto y **nunca solo**: la etiqueta siempre está presente, así
 * que el estado se lee igual sin distinguir colores.
 *
 * @property {string} etiqueta Texto del estado.
 * @property {ChipEstadoVariante} variante Color del punto.
 * @property {ChipSize} [size] Escala de la pastilla.
 * @property {boolean} [anchoFijo] Iguala el ancho entre pastillas, para que en una
 *   columna de tabla queden alineadas aunque los textos midan distinto.
 * @property {string} [className] Clases extra del contenedor.
 */
export interface ChipEstadoProps {
  etiqueta: string;
  variante: ChipEstadoVariante;
  size?: ChipSize;
  anchoFijo?: boolean;
  className?: string;
}

export function ChipEstado({
  etiqueta,
  variante,
  size = "md",
  anchoFijo = false,
  className = "",
}: ChipEstadoProps) {
  const escala = TAMANIOS[size];

  return (
    <span
      className={`
        inline-flex items-center rounded-shape-full border border-border bg-background-default
        font-semibold text-foreground shadow-sm
        ${escala.pastilla} ${escala.texto}
        ${anchoFijo ? "w-40 justify-start" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {/* Aro claro alrededor del punto: lo despega del fondo de la pastilla y hace
          que el color se lea igual en tema claro y oscuro. */}
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-shape-full bg-background-paper shadow-sm ${escala.aro}`}
      >
        <span className={`block rounded-shape-full ${COLOR_PUNTO[variante]} ${escala.punto}`} />
      </span>
      <span className="leading-none">{etiqueta}</span>
    </span>
  );
}
