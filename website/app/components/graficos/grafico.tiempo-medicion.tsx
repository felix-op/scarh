"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Area, ComposedChart, Line, Tooltip } from "recharts";
import { EjeTiempo, EjeValor, GrillaGrafico, LienzoGrafico } from "./lienzo-grafico";
import { FilaTooltip, LeyendaGrafico, TooltipGrafico } from "./tooltip-grafico";
import {
  ATRIBUTO_METADATA,
  MAX_SERIES_SOLO_COLOR,
  aPuntosDeGrafico,
  calcularCobertura,
  colorDeSerie,
  etiquetaResolucion,
  formatearMedicion,
} from "@utils";
import type { AtributoEstadistica, MedicionSerie } from "@models";

/**
 * Serie temporal de una variable, parametrizada por atributo.
 *
 * Es un solo componente para nivel, batería, temperatura y presión: cuatro archivos
 * serían cuatro copias del mismo eje temporal, el mismo tooltip y el mismo manejo de
 * huecos, que es donde está toda la dificultad.
 *
 * @property {MedicionSerie[]} series Series a dibujar. Comparten grilla de cubetas.
 * @property {AtributoEstadistica} atributo Variable graficada; define unidad y decimales.
 * @property {number} bucketSegundos Ancho de cubeta, para rotular la resolución.
 * @property {[number, number]} dominioTiempo Rango pedido, en milisegundos.
 * @property {[number, number]} [dominioValor] Eje Y compartido entre paneles.
 * @property {number[]} indicesColor Slot de color de cada serie, en el mismo orden.
 *   Es la posición estable del limnígrafo en la selección, no su orden de llegada.
 * @property {string} [titulo] Reemplaza el título por defecto.
 * @property {number} [altura] Alto del área de dibujo.
 * @property {import("react").ReactNode} [resumen] Tira de estadísticas del encabezado.
 */
export interface GraficoTiempoMedicionProps {
  series: MedicionSerie[];
  atributo: AtributoEstadistica;
  bucketSegundos: number;
  dominioTiempo: [number, number];
  dominioValor?: [number, number];
  indicesColor: number[];
  titulo?: string;
  altura?: number;
  resumen?: React.ReactNode;
}

export function GraficoTiempoMedicion({
  series,
  atributo,
  bucketSegundos,
  dominioTiempo,
  dominioValor,
  indicesColor,
  titulo,
  altura = 280,
  resumen,
}: GraficoTiempoMedicionProps) {
  const metadata = ATRIBUTO_METADATA[atributo];

  const datos = useMemo(() => {
    // Todas las series comparten la grilla de cubetas que armó el backend, así que
    // se combinan por índice sin necesidad de alinear timestamps.
    const largo = series[0]?.puntos.length ?? 0;
    const convertidas = series.map((serie) => aPuntosDeGrafico(serie.puntos));

    return Array.from({ length: largo }, (_, i) => {
      const fila: Record<string, number | [number, number] | null> = {
        timestamp: convertidas[0][i].timestamp,
      };
      series.forEach((serie, indice) => {
        fila[`prom_${serie.limnigrafo}`] = convertidas[indice][i].promedio;
        fila[`banda_${serie.limnigrafo}`] = convertidas[indice][i].banda;
      });
      return fila;
    });
  }, [series]);

  const cobertura = useMemo(() => calcularCobertura(series[0]?.puntos ?? []), [series]);

  const formatearValor = (valor: number) =>
    formatearMedicion(valor, atributo, { conUnidad: false });

  const formatearTiempo = (ms: number) => {
    const dias = (dominioTiempo[1] - dominioTiempo[0]) / 86_400_000;
    const patron = dias > 60 ? "MMM yy" : dias > 2 ? "dd/MM" : "HH:mm";
    return format(new Date(ms), patron, { locale: es });
  };

  const leyenda = series.map((serie, indice) => ({
    clave: String(serie.limnigrafo),
    nombre: serie.codigo,
    color: colorDeSerie(indicesColor[indice]),
  }));

  const subtitulo = [
    etiquetaResolucion(bucketSegundos),
    `cobertura ${cobertura.porcentaje} %`,
    cobertura.interrupciones > 0
      ? `${cobertura.interrupciones} ${cobertura.interrupciones === 1 ? "interrupción" : "interrupciones"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <LienzoGrafico
      titulo={titulo ?? metadata.label}
      subtitulo={subtitulo}
      aclaracion={
        <>
          {metadata.aclaracion && <p className="mb-1">{metadata.aclaracion}</p>}
          <p>
            Cada punto resume un intervalo: la línea es el promedio y la franja va del
            mínimo al máximo. Los tramos cortados no tuvieron mediciones.
          </p>
        </>
      }
      altura={altura}
      resumen={resumen}
      acciones={series.length > 1 ? <LeyendaGrafico filas={leyenda} /> : undefined}
    >
      <ComposedChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <GrillaGrafico />
        <EjeTiempo dominio={dominioTiempo} formatear={formatearTiempo} />
        <EjeValor dominio={dominioValor} formatear={formatearValor} />

        {series.map((serie, indice) => {
          const color = colorDeSerie(indicesColor[indice]);
          return (
            <Area
              key={`banda-${serie.limnigrafo}`}
              dataKey={`banda_${serie.limnigrafo}`}
              // Sin `connectNulls`: la franja se corta en los huecos igual que la
              // línea, en lugar de estirarse a través de un tramo sin datos.
              connectNulls={false}
              stroke="none"
              fill={color}
              fillOpacity={0.14}
              isAnimationActive={false}
              activeDot={false}
            />
          );
        })}

        {series.map((serie, indice) => {
          const color = colorDeSerie(indicesColor[indice]);
          return (
            <Line
              key={`prom-${serie.limnigrafo}`}
              type="monotone"
              dataKey={`prom_${serie.limnigrafo}`}
              name={serie.codigo}
              stroke={color}
              strokeWidth={2}
              // La ausencia de datos se ve como ausencia. Unir los extremos de un
              // hueco afirmaría que el valor evolucionó de forma continua durante un
              // período en el que nadie midió.
              connectNulls={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-background-paper)" }}
              isAnimationActive={false}
            />
          );
        })}

        <Tooltip
          cursor={{ stroke: "var(--color-chart-grid)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;

            const filas: FilaTooltip[] = series.flatMap((serie, indice) => {
              const fila = payload[0]?.payload as Record<string, unknown> | undefined;
              const promedio = fila?.[`prom_${serie.limnigrafo}`];
              const banda = fila?.[`banda_${serie.limnigrafo}`] as [number, number] | null;

              if (typeof promedio !== "number") {
                return [
                  {
                    clave: String(serie.limnigrafo),
                    nombre: serie.codigo,
                    color: colorDeSerie(indicesColor[indice]),
                    valor: "sin datos",
                  },
                ];
              }

              const rango = banda
                ? ` (${formatearValor(banda[0])}–${formatearValor(banda[1])})`
                : "";

              return [
                {
                  clave: String(serie.limnigrafo),
                  nombre: serie.codigo,
                  color: colorDeSerie(indicesColor[indice]),
                  valor: `${formatearMedicion(promedio, atributo)}${rango}`,
                },
              ];
            });

            return (
              <TooltipGrafico
                timestamp={typeof label === "number" ? label : undefined}
                filas={filas}
                nota={
                  series.length > MAX_SERIES_SOLO_COLOR
                    ? "Promedio del intervalo (mínimo–máximo)"
                    : undefined
                }
              />
            );
          }}
        />
      </ComposedChart>
    </LienzoGrafico>
  );
}
