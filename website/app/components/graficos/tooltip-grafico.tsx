"use client";

import { formatFechaHora } from "@utils";

/**
 * Fila del tooltip: una serie con su color, nombre y valor ya formateado.
 *
 * El nombre viaja como texto además del color porque la identidad de una serie no
 * puede depender sólo del color: es lo que permite superponer más series que las que
 * la paleta distingue con seguridad.
 */
export interface FilaTooltip {
  clave: string;
  nombre: string;
  color: string;
  valor: string;
}

/**
 * Tooltip de los gráficos temporales.
 *
 * @property {number} [timestamp] Instante del punto señalado.
 * @property {FilaTooltip[]} filas Series presentes en ese instante.
 * @property {string} [nota] Texto al pie, por ejemplo el rango de la cubeta.
 */
export interface TooltipGraficoProps {
  timestamp?: number;
  filas: FilaTooltip[];
  nota?: string;
}

export function TooltipGrafico({ timestamp, filas, nota }: TooltipGraficoProps) {
  if (filas.length === 0) return null;

  return (
    <div className="rounded-shape-sm border border-border bg-background-paper p-2.5 shadow-card">
      {timestamp !== undefined && (
        <p className="mb-1.5 text-xs font-medium text-foreground-title">
          {formatFechaHora(timestamp)}
        </p>
      )}

      <ul className="flex flex-col gap-1">
        {filas.map((fila) => (
          <li key={fila.clave} className="flex items-center gap-2 text-xs">
            {/* El color va en una marca aparte; el texto usa tokens de tinta. */}
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-shape-full"
              style={{ backgroundColor: fila.color }}
            />
            <span className="text-foreground-secondary">{fila.nombre}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">{fila.valor}</span>
          </li>
        ))}
      </ul>

      {nota && <p className="mt-1.5 text-[11px] text-foreground-disabled">{nota}</p>}
    </div>
  );
}

/** Leyenda de series. Siempre presente con 2 o más: la identidad no puede ser sólo el color. */
export function LeyendaGrafico({ filas }: { filas: Omit<FilaTooltip, "valor">[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {filas.map((fila) => (
        <li key={fila.clave} className="flex items-center gap-1.5 text-xs text-foreground-secondary">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-shape-full"
            style={{ backgroundColor: fila.color }}
          />
          {fila.nombre}
        </li>
      ))}
    </ul>
  );
}
