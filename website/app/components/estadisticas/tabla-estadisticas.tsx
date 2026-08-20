"use client";

import { TablaSimple, type TableColumn } from "../ui/tabla";
import { Alert } from "../ui/alerts";
import { Boton } from "../ui/botones";
import { IconifyIcon } from "../ui/iconify-icon";
import { InfoTooltip } from "../ui/info-tooltip";
import {
  ATRIBUTO_METADATA,
  encabezadoPrimeraColumna,
  etiquetaDeFila,
  exportarTablaEstadisticasCSV,
  formatearMedicion,
} from "@utils";
import type { AgrupacionEstadistica, AtributoEstadistica, EstadisticaFila } from "@models";

/**
 * Tabla de estadísticas descriptivas, en sus dos modos de comparación.
 *
 * Las columnas de métricas son idénticas en ambos: lo único que cambia es qué
 * representa una fila y, en consecuencia, el rótulo de la primera columna. Ese
 * rótulo es lo que le dice al usuario qué está comparando sin tener que recordarlo.
 *
 * @property {EstadisticaFila[]} filas Filas de datos.
 * @property {EstadisticaFila | null} total Fila agregada, resaltada al pie.
 * @property {AtributoEstadistica} atributo Variable analizada; define unidad y decimales.
 * @property {AgrupacionEstadistica} agrupacion Eje de comparación aplicado.
 * @property {boolean} [isLoading] Muestra el skeleton de carga.
 * @property {string} [nombreArchivo] Nombre del CSV exportado.
 * @property {string} [mensajeVacio] Texto del estado vacío.
 * @property {string} [subtitulo] Qué se está listando (ej. "Meses de LMG-A").
 */
export interface TablaEstadisticasProps {
  filas: EstadisticaFila[];
  total: EstadisticaFila | null;
  atributo: AtributoEstadistica;
  agrupacion: AgrupacionEstadistica;
  isLoading?: boolean;
  nombreArchivo?: string;
  mostrarExportar?: boolean;
  mensajeVacio?: string;
  subtitulo?: string;
}

/** Fila de la tabla con la etiqueta ya resuelta y la marca de fila agregada. */
interface FilaTabla extends EstadisticaFila {
  etiquetaVisible: string;
  esTotal: boolean;
}

const CELDA_BASE = "block px-4 py-4 text-sm";

/**
 * Claves de `EstadisticaFila` cuyo valor es numérico.
 *
 * Existe para que `columnaMetrica` no acepte `clave` ni `etiqueta`, que son
 * `string`: con `keyof EstadisticaFila` el compilador dejaba pasar
 * `columnaMetrica("etiqueta", …)` y recién en runtime fallaba, porque el formateo
 * llama a `toFixed()`. El error tiene que ser imposible de escribir, no un cast
 * que promete que no va a pasar.
 */
type ClaveMetrica = {
  [K in keyof EstadisticaFila]: EstadisticaFila[K] extends number | null ? K : never;
}[keyof EstadisticaFila];

export function TablaEstadisticas({
  filas,
  total,
  atributo,
  agrupacion,
  isLoading = false,
  nombreArchivo = "estadisticas.csv",
  mostrarExportar = true,
  mensajeVacio = "Elegí al menos un limnígrafo para ver estadísticas.",
  subtitulo,
}: TablaEstadisticasProps) {
  const metadata = ATRIBUTO_METADATA[atributo];

  const datos: FilaTabla[] = [
    ...filas.map((fila) => ({
      ...fila,
      etiquetaVisible: etiquetaDeFila(fila, agrupacion),
      esTotal: false,
    })),
    ...(total ? [{ ...total, etiquetaVisible: total.etiqueta, esTotal: true }] : []),
  ];

  const clasesCelda = (fila: FilaTabla, extra = "") =>
    `${CELDA_BASE} ${extra} ${fila.esTotal ? "font-semibold text-foreground-title" : "text-foreground"}`.trim();

  const columnaMetrica = (id: ClaveMetrica, header: string): TableColumn<FilaTabla> => ({
    id,
    header,
    cell: (fila) => (
      <span className={clasesCelda(fila, "tabular-nums")}>
        {formatearMedicion(fila[id], atributo, { conUnidad: false })}
      </span>
    ),
  });

  const columns: TableColumn<FilaTabla>[] = [
    {
      id: "etiquetaVisible",
      header: encabezadoPrimeraColumna(agrupacion),
      cell: (fila) => <span className={clasesCelda(fila)}>{fila.etiquetaVisible}</span>,
    },
    columnaMetrica("minimo", "Mínimo"),
    columnaMetrica("maximo", "Máximo"),
    columnaMetrica("promedio", "Promedio"),
    columnaMetrica("mediana", "Mediana"),
    columnaMetrica("moda", "Moda"),
    columnaMetrica("desvio_estandar", "Desvío estándar"),
    columnaMetrica("percentil_90", "Percentil 90"),
    {
      id: "total_registros",
      header: "Registros",
      cell: (fila) => (
        <span className={clasesCelda(fila, "tabular-nums")}>
          {fila.total_registros.toLocaleString("es-AR")}
        </span>
      ),
    },
  ];

  const hayDatos = datos.some((fila) => fila.total_registros > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row-reverse md:items-start md:justify-between">
        <Alert variant="alerta" title="Cómo leer las celdas vacías" className="w-full md:max-w-md">
          Un <strong>-</strong> significa que no hubo mediciones en ese período. No es lo mismo que un{" "}
          <strong>0</strong>, que es un valor efectivamente medido.
        </Alert>

        <div className={`flex flex-col items-start gap-2 ${subtitulo ? "" : "md:self-end"}`.trim()}>
          {subtitulo && (
            <h2 className="text-base font-semibold text-foreground-title">{subtitulo}</h2>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-secondary">
              Valores de <strong className="text-foreground">{metadata.label}</strong>
              {metadata.unidad && ` en ${metadata.unidad}`}
            </span>
            {metadata.aclaracion && <InfoTooltip content={metadata.aclaracion} />}
          </div>

          {mostrarExportar && (
            <InfoTooltip
              content={
                hayDatos
                  ? undefined
                  : "No hay mediciones en el rango elegido, así que no hay nada que exportar. Ampliá el rango o probá con otra variable."
              }
            >
              <Boton
                content="Exportar CSV"
                icon="descargar"
                disabled={!hayDatos}
                onClick={() =>
                  exportarTablaEstadisticasCSV({
                    nombreArchivo,
                    atributo,
                    agrupacion,
                    filas,
                    total,
                  })
                }
              />
            </InfoTooltip>
          )}
        </div>
      </div>

      <TablaSimple
        columns={columns}
        data={datos}
        rowIdKey="clave"
        isLoading={isLoading}
        emptyStateContent={
          <div className="flex w-full flex-col items-center justify-center gap-2 py-10 text-foreground-disabled">
            <IconifyIcon variant="alerta" className="text-3xl" />
            <span className="text-sm">{mensajeVacio}</span>
          </div>
        }
      />
    </div>
  );
}
