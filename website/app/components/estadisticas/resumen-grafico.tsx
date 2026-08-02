"use client";

import { ATRIBUTO_METADATA, formatearMedicion } from "@utils";
import type { AtributoEstadistica, EstadisticaFila } from "@models";

/**
 * Tira compacta de estadísticas del gráfico.
 *
 * Va en el encabezado y no a un costado: en la grilla de dos columnas, una columna
 * de números le robaría ancho al área de dibujo, que es lo único que el gráfico
 * aporta y la tabla no.
 *
 * Los valores vienen de `/estadisticas/tabla/`, el mismo endpoint que alimenta la
 * pestaña Comparativa, para que los dos lugares no puedan mostrar números distintos
 * de la misma cosa. No se derivan de las cubetas del gráfico: mínimo y máximo sí
 * saldrían bien, pero la mediana no se puede reconstruir a partir de promedios.
 *
 * @property {EstadisticaFila} [fila] Estadísticas del dispositivo. Sin ella no se
 *   renderiza nada.
 * @property {AtributoEstadistica} atributo Variable, para unidad y decimales.
 */
export interface ResumenGraficoProps {
  fila?: EstadisticaFila;
  atributo: AtributoEstadistica;
}

export function ResumenGrafico({ fila, atributo }: ResumenGraficoProps) {
  if (!fila) return null;

  const { unidad } = ATRIBUTO_METADATA[atributo];

  const metricas: { etiqueta: string; valor: string }[] = [
    { etiqueta: "Mín", valor: formatearMedicion(fila.minimo, atributo, { conUnidad: false }) },
    { etiqueta: "Prom", valor: formatearMedicion(fila.promedio, atributo, { conUnidad: false }) },
    { etiqueta: "Máx", valor: formatearMedicion(fila.maximo, atributo, { conUnidad: false }) },
    { etiqueta: "Mediana", valor: formatearMedicion(fila.mediana, atributo, { conUnidad: false }) },
    { etiqueta: "Registros", valor: fila.total_registros.toLocaleString("es-AR") },
  ];

  return (
    <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-shape-sm bg-background-default px-3 py-2">
      {metricas.map(({ etiqueta, valor }) => (
        <div key={etiqueta} className="flex items-baseline gap-1.5">
          <dt className="text-[11px] uppercase tracking-wide text-foreground-secondary">{etiqueta}</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">{valor}</dd>
        </div>
      ))}
      {unidad && (
        <span className="text-[11px] text-foreground-disabled">
          valores en {unidad}
        </span>
      )}
    </dl>
  );
}
