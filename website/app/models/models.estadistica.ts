/**
 * Variables numéricas de una medición sobre las que el backend calcula estadísticas.
 *
 * `presion` es la presión de la columna de agua sobre el sensor, no presión
 * atmosférica; la etiqueta visible lo aclara (ver `ATRIBUTO_METADATA`).
 */
export type AtributoEstadistica = "altura_agua" | "presion" | "temperatura" | "nivel_de_bateria";

/**
 * Eje de comparación de la tabla de estadísticas: qué representa cada fila.
 *
 * `dispositivo` produce una fila por limnígrafo dentro de un mismo rango.
 * El resto produce una fila por período, de un único limnígrafo.
 */
export type AgrupacionEstadistica = "dispositivo" | "dia" | "semana" | "mes" | "anio";

/**
 * Una fila de la tabla de estadísticas.
 *
 * Todas las métricas son `null` cuando la fila no tiene mediciones: `0` es un
 * valor plausible de altura o temperatura y no puede usarse como "sin datos".
 * `desvio_estandar` también es `null` con un solo registro, porque el desvío
 * muestral no está definido para n = 1.
 *
 * @property {string} clave Identificador estable de la fila: ID del limnígrafo, o
 *   clave del período (`2026-01-15`, `2026-W03`, `2026-01`, `2026`).
 * @property {string} etiqueta Texto sugerido por el backend para la primera columna.
 * @property {number | null} limnigrafo ID del limnígrafo; `null` en la fila global.
 * @property {string | null} periodo_inicio Comienzo del período en ISO, sólo en agrupación temporal.
 * @property {string | null} periodo_fin Fin exclusivo del período en ISO, sólo en agrupación temporal.
 * @property {number} total_registros Cantidad de mediciones con valor en la fila.
 * @property {number | null} minimo Valor mínimo.
 * @property {number | null} maximo Valor máximo.
 * @property {number | null} promedio Media aritmética.
 * @property {number | null} mediana Mediana.
 * @property {number | null} moda Moda agrupada a 2 decimales.
 * @property {number | null} desvio_estandar Desvío muestral (divide por n-1).
 * @property {number | null} percentil_90 Percentil 90 por interpolación lineal.
 */
export interface EstadisticaFila {
  clave: string;
  etiqueta: string;
  limnigrafo: number | null;
  periodo_inicio: string | null;
  periodo_fin: string | null;
  total_registros: number;
  minimo: number | null;
  maximo: number | null;
  promedio: number | null;
  mediana: number | null;
  moda: number | null;
  desvio_estandar: number | null;
  percentil_90: number | null;
}

/**
 * Respuesta de `GET /estadisticas/tabla/`.
 *
 * @property {AtributoEstadistica} atributo Variable resumida.
 * @property {AgrupacionEstadistica} agrupar_por Eje de comparación aplicado.
 * @property {string} fecha_inicio Comienzo del rango analizado, en ISO.
 * @property {string} fecha_fin Fin del rango analizado, en ISO.
 * @property {EstadisticaFila[]} filas Filas de datos, en orden de presentación.
 * @property {EstadisticaFila | null} total Fila agregada sobre todas las filas.
 *   `null` cuando no aporta nada (un solo limnígrafo agrupado por dispositivo).
 */
export interface EstadisticaTablaResponse {
  atributo: AtributoEstadistica;
  agrupar_por: AgrupacionEstadistica;
  fecha_inicio: string;
  fecha_fin: string;
  filas: EstadisticaFila[];
  total: EstadisticaFila | null;
}

/**
 * Query params de `GET /estadisticas/tabla/`. El backend responde 400 si falta
 * cualquiera de los obligatorios, así que van requeridos en el tipo.
 *
 * @property {string} limnigrafos IDs separados por coma. No puede ir vacío.
 * @property {AtributoEstadistica} atributo Variable a resumir.
 * @property {string} fecha_inicio Comienzo del rango, en ISO con offset.
 * @property {string} fecha_fin Fin del rango, en ISO con offset.
 * @property {AgrupacionEstadistica} [agrupar_por] Eje de comparación. Por defecto `dispositivo`.
 */
export type EstadisticaTablaQueryParams = {
  limnigrafos: string;
  atributo: AtributoEstadistica;
  fecha_inicio: string;
  fecha_fin: string;
  agrupar_por?: AgrupacionEstadistica;
};
