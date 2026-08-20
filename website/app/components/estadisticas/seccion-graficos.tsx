"use client";

import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { Alert } from "../ui/alerts";
import { Switch } from "../ui/switch";
import { ResumenGrafico } from "./resumen-grafico";
import {
  ATRIBUTO_METADATA,
  MAX_SERIES_SOLO_COLOR,
  dominioCompartido,
} from "@utils";
import type {
  AtributoEstadistica,
  EstadisticaFila,
  MedicionSerieResponse,
} from "@models";

// Los gráficos se cargan sólo en el cliente: recharts mide el ancho del contenedor
// para dibujar, así que no hay nada que ganar renderizándolo en el servidor. El
// import dinámico vive acá, en un componente cliente, porque `ssr: false` no está
// permitido desde un Server Component.
const GraficoTiempoMedicion = dynamic(
  () => import("../graficos/grafico.tiempo-medicion").then((m) => m.GraficoTiempoMedicion),
  { ssr: false, loading: () => <EsqueletoGrafico /> }
);

const GraficoTasaCambio = dynamic(
  () => import("../graficos/grafico.tasa-cambio").then((m) => m.GraficoTasaCambio),
  { ssr: false, loading: () => <EsqueletoGrafico /> }
);

/**
 * Pestaña de gráficos.
 *
 * Disposición:
 * - **Un dispositivo**: dos gráficos lado a lado — la variable y su velocidad de cambio.
 * - **Varios**: una fila por dispositivo, con los mismos dos gráficos. El eje Y es
 *   común a todas las filas, porque si cada panel auto-escalara, dos sensores con
 *   niveles muy distintos se dibujarían con la misma forma y comparar sería falso.
 * - **Superpuesto** (opcional): un solo par de gráficos con todas las series juntas.
 *
 * En mobile siempre es una columna y cada gráfico ocupa el ancho completo.
 *
 * @property {MedicionSerieResponse} datos Series ya agrupadas por el backend.
 * @property {AtributoEstadistica} atributo Variable graficada.
 * @property {EstadisticaFila[]} estadisticas Filas de `/estadisticas/tabla/`, para las
 *   tiras de resumen. Se buscan por `limnigrafo`.
 */
export interface SeccionGraficosProps {
  datos: MedicionSerieResponse;
  atributo: AtributoEstadistica;
  estadisticas: EstadisticaFila[];
  agruparSiempre: boolean;
  onAgruparSiempreChange: (_agruparSiempre: boolean) => void;
}

export const SeccionGraficos = memo(function SeccionGraficos({
  datos,
  atributo,
  estadisticas,
  agruparSiempre,
  onAgruparSiempreChange,
}: SeccionGraficosProps) {
  const [superpuesto, setSuperpuesto] = useState(false);

  const series = datos.series;
  const dominioTiempo: [number, number] = [
    new Date(datos.fecha_inicio).getTime(),
    new Date(datos.fecha_fin).getTime(),
  ];

  // El eje Y se calcula sobre TODAS las series, no por panel: es lo que hace que
  // comparar las filas entre sí signifique algo.
  const dominioValor = dominioCompartido(series);

  const estadisticaDe = (limnigrafo: number) =>
    estadisticas.find((fila) => fila.limnigrafo === limnigrafo);

  // La velocidad de cambio sólo tiene sentido en variables que evolucionan de forma
  // continua. En batería, que se recarga a saltos, la derivada es ruido.
  const muestraTasa = atributo !== "nivel_de_bateria";

  if (series.length === 0) {
    return (
      <Alert variant="alerta" title="Sin dispositivos seleccionados">
        Elegí al menos un limnígrafo para ver sus gráficos.
      </Alert>
    );
  }

  const sinDatos = series.every((serie) => serie.total_registros === 0);

  const unSoloDispositivo = series.length === 1;
  const enUnPanel = unSoloDispositivo || superpuesto;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        {sinDatos ? (
          <Alert variant="alerta" title="Sin mediciones" className="md:flex-1">
            Probá con otro rango o variable.
          </Alert>
        ) : (
          <div />
        )}

        <div className="flex flex-col items-start gap-2">
          <div className="w-fit">
            <Switch
              description="Agrupar mediciones siempre"
              name="agrupar-siempre"
              checked={agruparSiempre}
              onChange={onAgruparSiempreChange}
            />
          </div>

          {!unSoloDispositivo && (
            <div className="w-fit">
              <Switch
                description="Superponer dispositivos"
                name="superpuesto"
                checked={superpuesto}
                onChange={setSuperpuesto}
              />
            </div>
          )}
        </div>
      </div>

      {superpuesto && series.length > MAX_SERIES_SOLO_COLOR && (
        <Alert variant="info" title={`${series.length} series superpuestas`}>
          Con más de {MAX_SERIES_SOLO_COLOR} series los colores dejan de ser
          suficientes para distinguirlas —sobre todo con daltonismo—, así que usá la
          leyenda y el tooltip, que nombran cada dispositivo. Si sólo querés comparar
          formas, la vista apilada suele leerse mejor.
        </Alert>
      )}

      {enUnPanel ? (
        <div className={`grid grid-cols-1 gap-4 ${muestraTasa ? "xl:grid-cols-2" : ""}`}>
          <GraficoTiempoMedicion
            series={series}
            atributo={atributo}
            bucketSegundos={datos.bucket_segundos}
            dominioTiempo={dominioTiempo}
            dominioValor={dominioValor}
            indicesColor={series.map((_, indice) => indice)}
            titulo={
              unSoloDispositivo
                ? `${ATRIBUTO_METADATA[atributo].label} · ${series[0].codigo}`
                : undefined
            }
            resumen={
              unSoloDispositivo ? (
                <ResumenGrafico fila={estadisticaDe(series[0].limnigrafo)} atributo={atributo} />
              ) : undefined
            }
          />

          {muestraTasa && (
            <GraficoTasaCambio
              series={series}
              atributo={atributo}
              bucketSegundos={datos.bucket_segundos}
              dominioTiempo={dominioTiempo}
              indicesColor={series.map((_, indice) => indice)}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {series.map((serie, indice) => (
            <div
              key={serie.limnigrafo}
              className={`grid grid-cols-1 gap-4 ${muestraTasa ? "xl:grid-cols-2" : ""}`}
            >
              <GraficoTiempoMedicion
                series={[serie]}
                atributo={atributo}
                bucketSegundos={datos.bucket_segundos}
                dominioTiempo={dominioTiempo}
                dominioValor={dominioValor}
                // El color sigue al dispositivo, no a la fila: se pasa su posición en
                // la selección para que filtrar uno no repinte a los demás.
                indicesColor={[indice]}
                titulo={`${ATRIBUTO_METADATA[atributo].label} · ${serie.codigo}`}
                resumen={
                  <ResumenGrafico fila={estadisticaDe(serie.limnigrafo)} atributo={atributo} />
                }
              />

              {muestraTasa && (
                <GraficoTasaCambio
                  series={[serie]}
                  atributo={atributo}
                  bucketSegundos={datos.bucket_segundos}
                  dominioTiempo={dominioTiempo}
                  indicesColor={[indice]}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}, (previas, siguientes) =>
  previas.datos === siguientes.datos &&
  previas.atributo === siguientes.atributo &&
  previas.estadisticas === siguientes.estadisticas &&
  previas.agruparSiempre === siguientes.agruparSiempre
);

function EsqueletoGrafico() {
  return (
    <div className="flex h-[336px] w-full flex-col gap-3 rounded-shape-md border border-border bg-card p-4">
      <div className="h-4 w-40 animate-pulse rounded-shape-sm bg-background-muted" />
      <div className="h-8 w-full animate-pulse rounded-shape-sm bg-background-muted" />
      <div className="flex-1 animate-pulse rounded-shape-sm bg-background-muted" />
    </div>
  );
}
