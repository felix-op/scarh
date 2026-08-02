import type { AgrupacionEstadistica, AtributoEstadistica } from "@models";

/**
 * Metadatos de presentación de cada variable medida.
 *
 * Definición única a propósito: en el frontend legacy esto estaba duplicado en
 * dos archivos con etiquetas distintas, y las tarjetas y el gráfico de la misma
 * pantalla nombraban diferente la misma cosa.
 *
 * @property {string} label Nombre visible de la variable.
 * @property {string} unidad Sufijo de unidad, vacío si no corresponde.
 * @property {number} decimales Decimales con los que se formatea.
 * @property {string} [aclaracion] Texto de `info-tooltip` cuando el nombre puede confundirse.
 */
export const ATRIBUTO_METADATA: Record<
  AtributoEstadistica,
  { label: string; unidad: string; decimales: number; aclaracion?: string }
> = {
  altura_agua: { label: "Nivel del agua", unidad: "m", decimales: 2 },
  presion: {
    label: "Presión hidrostática",
    unidad: "hPa",
    decimales: 2,
    aclaracion:
      "Presión ejercida por la columna de agua sobre el sensor. No es presión atmosférica.",
  },
  temperatura: { label: "Temperatura", unidad: "°C", decimales: 2 },
  nivel_de_bateria: { label: "Nivel de batería", unidad: "%", decimales: 1 },
};

/** Opciones del selector de variable, en el orden en que se muestran. */
export const opcionesAtributoEstadistica = (
  Object.keys(ATRIBUTO_METADATA) as AtributoEstadistica[]
).map((valor) => ({ value: valor, label: ATRIBUTO_METADATA[valor].label }));

/**
 * Ventanas rápidas de tiempo. `dias` es la cantidad de días hacia atrás desde ahora;
 * `personalizado` no tiene duración porque el rango lo elige el usuario.
 */
export const VENTANAS_ESTADISTICAS: { value: string; label: string; dias?: number }[] = [
  { value: "24h", label: "Últimas 24 horas", dias: 1 },
  { value: "7d", label: "Últimos 7 días", dias: 7 },
  { value: "30d", label: "Últimos 30 días", dias: 30 },
  { value: "90d", label: "Últimos 90 días", dias: 90 },
  { value: "365d", label: "Último año", dias: 365 },
  { value: "personalizado", label: "Rango personalizado" },
];

/** Ventana usada cuando la URL no trae ninguna. */
export const VENTANA_POR_DEFECTO = "7d";

/** Variable usada cuando la URL no trae ninguna. Es la principal del sistema. */
export const ATRIBUTO_POR_DEFECTO: AtributoEstadistica = "altura_agua";

/**
 * Vistas de la pantalla de estadísticas.
 *
 * Están nombradas por el eje de comparación y no por el formato de salida: así el
 * rótulo mismo dice cuántos dispositivos acepta cada una y no hace falta que el
 * selector de dispositivos cambie de forma inesperada.
 */
export const VISTAS_ESTADISTICAS = [
  { value: "graficos", label: "Gráficos" },
  { value: "comparativa", label: "Comparar dispositivos" },
  { value: "resumen", label: "Resumen por período" },
] as const;

export type VistaEstadistica = (typeof VISTAS_ESTADISTICAS)[number]["value"];

/** Vista que se abre cuando la URL no trae ninguna. */
export const VISTA_POR_DEFECTO: VistaEstadistica = "comparativa";

/**
 * Metadatos de presentación de cada eje de comparación.
 *
 * Las tres formas viven juntas porque son la misma cosa dicha de tres maneras, y
 * separarlas es cómo se desincronizan: el frontend legacy tenía `ATRIBUTO_METADATA`
 * definido en dos archivos con etiquetas distintas, y las tarjetas y el gráfico de
 * la misma pantalla nombraban diferente la misma variable.
 *
 * @property {string} label Opción del selector ("Mensual").
 * @property {string} plural Sustantivo para encabezados ("Meses de LMG-A").
 * @property {string} columna Rótulo de la primera columna de la tabla.
 */
export const AGRUPACION_METADATA: Record<
  AgrupacionEstadistica,
  { label: string; plural: string; columna: string }
> = {
  dispositivo: { label: "Por dispositivo", plural: "Dispositivos", columna: "Limnígrafo" },
  dia: { label: "Diario", plural: "Días", columna: "Período" },
  semana: { label: "Semanal", plural: "Semanas", columna: "Período" },
  mes: { label: "Mensual", plural: "Meses", columna: "Período" },
  anio: { label: "Anual", plural: "Años", columna: "Período" },
};

/** Granularidades temporales, en orden de menor a mayor. */
export const AGRUPACIONES_PERIODO: AgrupacionEstadistica[] = ["dia", "semana", "mes", "anio"];

/** Opciones del selector de granularidad en la vista de resumen por período. */
export const opcionesAgrupacionPeriodo = AGRUPACIONES_PERIODO.map((valor) => ({
  value: valor,
  label: AGRUPACION_METADATA[valor].label,
}));

/** Granularidad usada cuando la URL no trae ninguna. */
export const AGRUPACION_POR_DEFECTO: AgrupacionEstadistica = "mes";
