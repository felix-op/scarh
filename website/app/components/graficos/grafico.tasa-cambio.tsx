"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Line, LineChart, ReferenceLine, Tooltip } from "recharts";
import { EjeTiempo, EjeValor, GrillaGrafico, LienzoGrafico } from "./lienzo-grafico";
import { FilaTooltip, LeyendaGrafico, TooltipGrafico } from "./tooltip-grafico";
import { calcularTasaDeCambio, colorDeSerie, unidadDeTasa } from "@utils";
import type { AtributoEstadistica, MedicionSerie } from "@models";

/**
 * Velocidad de variación de la medición, en unidades por hora.
 *
 * Es el único gráfico que muestra **qué tan rápido** cambia el valor en lugar del
 * valor absoluto: dos sensores pueden estar a alturas muy distintas y sin embargo
 * subir al mismo ritmo, y al revés.
 *
 * @property {MedicionSerie[]} series Series a derivar.
 * @property {AtributoEstadistica} atributo Variable de origen; define la unidad.
 * @property {number} bucketSegundos Ancho de cubeta, base del cálculo de la tasa.
 * @property {[number, number]} dominioTiempo Rango pedido, en milisegundos.
 * @property {number[]} indicesColor Slot de color de cada serie, en el mismo orden.
 * @property {number} [altura] Alto del área de dibujo.
 * @property {import("react").ReactNode} [resumen] Tira de estadísticas del encabezado.
 */
export interface GraficoTasaCambioProps {
  series: MedicionSerie[];
  atributo: AtributoEstadistica;
  bucketSegundos: number;
  dominioTiempo: [number, number];
  indicesColor: number[];
  altura?: number;
  resumen?: React.ReactNode;
}

export function GraficoTasaCambio({
  series,
  atributo,
  bucketSegundos,
  dominioTiempo,
  indicesColor,
  altura = 280,
  resumen,
}: GraficoTasaCambioProps) {
  const unidad = unidadDeTasa(atributo);

  const { datos, descartados } = useMemo(() => {
    const tasas = series.map((serie) => calcularTasaDeCambio(serie.puntos, bucketSegundos));
    const largo = tasas[0]?.length ?? 0;

    const filas = Array.from({ length: largo }, (_, i) => {
      const fila: Record<string, number | null> = { timestamp: tasas[0][i].timestamp };
      series.forEach((serie, indice) => {
        fila[`tasa_${serie.limnigrafo}`] = tasas[indice][i].tasa;
      });
      return fila;
    });

    // Intervalos que no se pudieron calcular porque cruzaban un hueco. Se informan
    // en lugar de desaparecer: si se descartó la mitad, el gráfico dice poco.
    const sinCalcular = tasas.reduce(
      (total, serie) => total + serie.filter((punto) => punto.tasa === null).length,
      0
    );

    return { datos: filas, descartados: sinCalcular };
  }, [series, bucketSegundos]);

  const formatearTasa = (valor: number) => valor.toFixed(2);

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
    `en ${unidad}`,
    descartados > 0 ? `${descartados} intervalos sin calcular` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <LienzoGrafico
      titulo="Velocidad de cambio"
      subtitulo={subtitulo}
      aclaracion={
        <>
          <p className="mb-1">
            Variación por hora entre intervalos consecutivos. Por encima de cero el valor
            sube; por debajo, baja.
          </p>
          <p>
            Los intervalos que cruzan un tramo sin mediciones no se calculan: repartir la
            variación sobre un hueco daría una velocidad baja y falsa justo cuando no se
            sabe qué pasó.
          </p>
        </>
      }
      altura={altura}
      resumen={resumen}
      acciones={series.length > 1 ? <LeyendaGrafico filas={leyenda} /> : undefined}
    >
      <LineChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <GrillaGrafico />
        <EjeTiempo dominio={dominioTiempo} formatear={formatearTiempo} />
        <EjeValor formatear={formatearTasa} />

        {/* El cero es la referencia que separa subida de bajada. */}
        <ReferenceLine y={0} stroke="var(--color-foreground-disabled)" strokeWidth={1} />

        {series.map((serie, indice) => (
          <Line
            key={serie.limnigrafo}
            type="monotone"
            dataKey={`tasa_${serie.limnigrafo}`}
            name={serie.codigo}
            stroke={colorDeSerie(indicesColor[indice])}
            strokeWidth={2}
            connectNulls={false}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-background-paper)" }}
            isAnimationActive={false}
          />
        ))}

        <Tooltip
          cursor={{ stroke: "var(--color-chart-grid)", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;

            const fila = payload[0]?.payload as Record<string, unknown> | undefined;

            const filas: FilaTooltip[] = series.map((serie, indice) => {
              const tasa = fila?.[`tasa_${serie.limnigrafo}`];
              return {
                clave: String(serie.limnigrafo),
                nombre: serie.codigo,
                color: colorDeSerie(indicesColor[indice]),
                valor:
                  typeof tasa === "number"
                    ? `${tasa > 0 ? "+" : ""}${tasa.toFixed(2)} ${unidad}`
                    : "sin datos",
              };
            });

            return (
              <TooltipGrafico
                timestamp={typeof label === "number" ? label : undefined}
                filas={filas}
              />
            );
          }}
        />
      </LineChart>
    </LienzoGrafico>
  );
}
