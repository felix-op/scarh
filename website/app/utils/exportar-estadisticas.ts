import type { AgrupacionEstadistica, AtributoEstadistica, EstadisticaFila } from "@models";
import { ATRIBUTO_METADATA } from "./constantes-estadisticas";
import { encabezadoPrimeraColumna, etiquetaDeFila } from "./estadisticas.utiles";
import { exportarComoCSV } from "./exportar.utiles";

/**
 * Opciones de exportación de la tabla de estadísticas.
 * @property {string} nombreArchivo Nombre del archivo descargado.
 * @property {AtributoEstadistica} atributo Variable analizada.
 * @property {AgrupacionEstadistica} agrupacion Eje de comparación aplicado.
 * @property {EstadisticaFila[]} filas Filas de datos.
 * @property {EstadisticaFila | null} total Fila agregada, si la hay.
 */
export interface ExportarTablaEstadisticasOptions {
  nombreArchivo: string;
  atributo: AtributoEstadistica;
  agrupacion: AgrupacionEstadistica;
  filas: EstadisticaFila[];
  total: EstadisticaFila | null;
}

/**
 * Exporta la tabla de estadísticas a CSV desde el navegador.
 *
 * Se arma en el cliente y no en el backend porque los datos ya están en memoria y
 * son decenas de filas, no miles: pedir un endpoint para esto sería un viaje de
 * ida y vuelta por algo que ya se tiene.
 *
 * Los valores se exportan sin unidad y con punto decimal, que es lo que espera una
 * planilla; la unidad va en el encabezado de cada columna.
 */
export function exportarTablaEstadisticasCSV({
  nombreArchivo,
  atributo,
  agrupacion,
  filas,
  total,
}: ExportarTablaEstadisticasOptions): void {
  const { unidad, decimales } = ATRIBUTO_METADATA[atributo];
  const sufijo = unidad ? ` (${unidad})` : "";

  const headers = [
    encabezadoPrimeraColumna(agrupacion),
    `Mínimo${sufijo}`,
    `Máximo${sufijo}`,
    `Promedio${sufijo}`,
    `Mediana${sufijo}`,
    `Moda${sufijo}`,
    `Desvío estándar${sufijo}`,
    `Percentil 90${sufijo}`,
    "Registros",
  ];

  const numero = (valor: number | null) => (valor === null ? "" : valor.toFixed(decimales));

  const aFila = (fila: EstadisticaFila, etiqueta: string) => [
    etiqueta,
    numero(fila.minimo),
    numero(fila.maximo),
    numero(fila.promedio),
    numero(fila.mediana),
    numero(fila.moda),
    numero(fila.desvio_estandar),
    numero(fila.percentil_90),
    fila.total_registros,
  ];

  const rows = filas.map((fila) => aFila(fila, etiquetaDeFila(fila, agrupacion)));
  if (total) rows.push(aFila(total, total.etiqueta));

  exportarComoCSV(nombreArchivo, headers, rows);
}
