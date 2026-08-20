import type { AtributoEstadistica } from "./models.estadistica";

/**
 * Una cubeta de la serie temporal.
 *
 * Se recibe mínimo y máximo además del promedio para poder dibujar una banda:
 * promediar solo aplana los picos de crecida, que es justamente lo que el gráfico
 * existe para detectar.
 *
 * Cuando `total_registros` es 0 el tramo no tuvo mediciones y las tres métricas son
 * `null`. El gráfico debe **cortar la línea** ahí, no interpolar: trazar una recta
 * a través de un hueco afirma que el nivel evolucionó de forma continua durante un
 * período en el que nadie midió.
 *
 * @property {string} inicio Comienzo de la cubeta, en ISO.
 * @property {number} total_registros Mediciones con valor dentro de la cubeta.
 * @property {number | null} minimo Valor mínimo de la cubeta.
 * @property {number | null} maximo Valor máximo de la cubeta.
 * @property {number | null} promedio Media de la cubeta.
 */
export interface MedicionSeriePunto {
  inicio: string;
  total_registros: number;
  minimo: number | null;
  maximo: number | null;
  promedio: number | null;
}

/**
 * Serie de un limnígrafo. Todas las series de una respuesta comparten la misma
 * grilla de cubetas, así que se pueden superponer directamente sin alinear nada.
 *
 * @property {number} limnigrafo ID del limnígrafo.
 * @property {string} codigo Código del limnígrafo, para leyenda y etiquetas.
 * @property {number} total_registros Mediciones del dispositivo en todo el rango.
 * @property {MedicionSeriePunto[]} puntos Cubetas en orden cronológico.
 */
export interface MedicionSerie {
  limnigrafo: number;
  codigo: string;
  total_registros: number;
  puntos: MedicionSeriePunto[];
}

/**
 * Respuesta de `GET /medicion/serie/`.
 *
 * @property {AtributoEstadistica} atributo Variable graficada.
 * @property {string} fecha_inicio Comienzo del rango analizado, en ISO.
 * @property {string} fecha_fin Fin del rango analizado, en ISO.
 * @property {number} bucket_segundos Ancho de cubeta que eligió el servidor. Se
 *   rotula en el encabezado ("1 punto cada 3 h") para que nadie lea un valor
 *   puntual donde en realidad hay un rango agregado.
 * @property {number} total_puntos Cantidad de cubetas de cada serie.
 * @property {MedicionSerie[]} series Una por limnígrafo pedido, en ese orden.
 */
export interface MedicionSerieResponse {
  atributo: AtributoEstadistica;
  fecha_inicio: string;
  fecha_fin: string;
  bucket_segundos: number;
  total_puntos: number;
  series: MedicionSerie[];
}

/**
 * Query params de `GET /medicion/serie/`.
 *
 * @property {string} limnigrafos IDs separados por coma. No puede ir vacío.
 * @property {AtributoEstadistica} atributo Variable a graficar.
 * @property {string} fecha_inicio Comienzo del rango, en ISO.
 * @property {string} fecha_fin Fin del rango, en ISO.
 * @property {number} [max_puntos] Techo de puntos por serie (10 a 1000, 200 por defecto).
 *   El servidor puede devolver menos si los datos no dan para esa resolución.
 * @property {boolean} [agrupar_siempre] Conserva las cubetas aunque todos los datos
 *   del período entren dentro de `max_puntos`.
 */
export type MedicionSerieQueryParams = {
  limnigrafos: string;
  atributo: AtributoEstadistica;
  fecha_inicio: string;
  fecha_fin: string;
  max_puntos?: number;
  agrupar_siempre?: boolean;
};
