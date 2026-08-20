import type { AtributoEstadistica, MedicionSerie, MedicionSeriePunto } from "@models";
import { ATRIBUTO_METADATA } from "./mediciones.formato";

/** Cantidad de slots de la paleta categórica (`--chart-1` … `--chart-8`). */
export const CANTIDAD_COLORES_SERIE = 8;

/**
 * Máximo de series superpuestas cuya identidad puede descansar sólo en el color.
 *
 * Por encima de este número la paleta ya no garantiza que dos series se distingan
 * con daltonismo, así que la vista superpuesta **debe** agregar identificación
 * adicional: etiqueta al final de cada línea, leyenda y tooltip con el código.
 * Ver el bloque de comentarios de `--chart-*` en `styles/tema-claro.css`.
 */
export const MAX_SERIES_SOLO_COLOR = 3;

/**
 * Token CSS del color de una serie, por posición.
 *
 * El color sigue a la **entidad** y no a su posición en la lista filtrada: el
 * índice que se pasa acá tiene que ser estable (la posición del limnígrafo en la
 * selección), no el orden de llegada de los datos. Si no, filtrar un dispositivo
 * repinta a los demás y quien había aprendido "Río Olivia es el azul" queda
 * desorientado.
 */
export function colorDeSerie(indice: number): string {
  return `var(--chart-${(indice % CANTIDAD_COLORES_SERIE) + 1})`;
}

/**
 * Rótulo legible del ancho de cubeta, para el encabezado del gráfico.
 *
 * Decirlo es obligatorio: cada punto es un agregado de un intervalo, no una
 * medición puntual, y sin el rótulo el lector cree estar viendo lo segundo.
 */
export function etiquetaResolucion(bucketSegundos: number): string {
  if (bucketSegundos === 0) return "mediciones sin agrupar";
  if (bucketSegundos < 3600) {
    const minutos = Math.round(bucketSegundos / 60);
    return `1 punto cada ${minutos} min`;
  }
  if (bucketSegundos < 86400) {
    const horas = Math.round(bucketSegundos / 3600);
    return `1 punto cada ${horas} h`;
  }
  const dias = Math.round(bucketSegundos / 86400);
  return dias === 1 ? "1 punto por día" : `1 punto cada ${dias} días`;
}

/**
 * Cobertura de una serie: qué porción del período tuvo mediciones, y en cuántos
 * tramos se cortó.
 *
 * Es el dato que le dice al usuario cuánto confiar en lo que está viendo. Un
 * gráfico con 40 % de cobertura y otro con 100 % se ven parecidos si no se lo
 * aclara.
 *
 * @returns `porcentaje` de cubetas con datos e `interrupciones`, contando cada
 *   corrida contigua de cubetas vacías como una sola interrupción.
 */
export function calcularCobertura(puntos: MedicionSeriePunto[]): {
  porcentaje: number;
  interrupciones: number;
} {
  if (puntos.length === 0) return { porcentaje: 0, interrupciones: 0 };

  let conDatos = 0;
  let interrupciones = 0;
  let enHueco = false;

  for (const punto of puntos) {
    if (punto.total_registros > 0) {
      conDatos += 1;
      enHueco = false;
    } else {
      if (!enHueco) interrupciones += 1;
      enHueco = true;
    }
  }

  return {
    porcentaje: Math.round((conDatos / puntos.length) * 100),
    interrupciones,
  };
}

/**
 * Punto de la serie en el formato que consume recharts.
 *
 * `timestamp` en milisegundos porque el eje X es numérico y no categórico: con un
 * eje categórico recharts reparte los puntos con separación uniforme sin importar
 * cuánto tiempo pasó entre uno y otro, y una interrupción de dos horas ocupa lo
 * mismo que un intervalo normal. Es decir, el gráfico miente sobre el tiempo.
 *
 * @property {number} timestamp Milisegundos del comienzo de la cubeta.
 * @property {number | null} promedio Línea central; `null` en los huecos.
 * @property {[number, number] | null} banda Par `[mínimo, máximo]` de la cubeta.
 */
export interface PuntoGrafico {
  timestamp: number;
  promedio: number | null;
  banda: [number, number] | null;
}

/** Convierte una serie del backend al formato de recharts. */
export function aPuntosDeGrafico(puntos: MedicionSeriePunto[]): PuntoGrafico[] {
  return puntos.map((punto) => ({
    timestamp: new Date(punto.inicio).getTime(),
    promedio: punto.promedio,
    banda:
      punto.minimo !== null && punto.maximo !== null
        ? ([punto.minimo, punto.maximo] as [number, number])
        : null,
  }));
}

/**
 * Punto de la serie de tasa de cambio.
 *
 * @property {number} timestamp Milisegundos del final del intervalo.
 * @property {number | null} tasa Variación por hora; `null` cuando el intervalo
 *   no se puede calcular.
 */
export interface PuntoTasa {
  timestamp: number;
  tasa: number | null;
}

/**
 * Tasa de cambio entre cubetas consecutivas, en unidades por hora.
 *
 * Se calcula sobre los promedios de cubeta y no sobre mediciones crudas porque la
 * cubeta ya suaviza el ruido del sensor.
 *
 * **Los intervalos que cruzan un hueco se descartan**, y esto es lo importante: el
 * frontend anterior calculaba `Δaltura / Δt` sin mirar si había datos en el medio,
 * así que una interrupción de dos horas durante una crecida producía una tasa baja
 * y tranquilizadora. Si el río subió 40 cm mientras nadie medía, el valor honesto
 * no es "0,2 cm/h", es "no se sabe".
 */
export function calcularTasaDeCambio(
  puntos: MedicionSeriePunto[],
  bucketSegundos: number
): PuntoTasa[] {
  const horas = bucketSegundos / 3600;

  return puntos.slice(1).map((punto, indice) => {
    const anterior = puntos[indice];
    const hayContinuidad = anterior.promedio !== null && punto.promedio !== null;

    return {
      timestamp: new Date(punto.inicio).getTime(),
      tasa: hayContinuidad ? (punto.promedio! - anterior.promedio!) / horas : null,
    };
  });
}

/** Unidad de la tasa de cambio, derivada de la variable: "cm/h", "°C/h", "V/h". */
export function unidadDeTasa(atributo: AtributoEstadistica): string {
  const { unidad } = ATRIBUTO_METADATA[atributo];
  return unidad ? `${unidad}/h` : "/h";
}

/**
 * Dominio del eje Y compartido por varias series.
 *
 * En vista de filas (un gráfico por dispositivo) el eje Y **tiene** que ser el
 * mismo en todos: si cada panel auto-escala, dos sensores con niveles muy
 * distintos se dibujan con la misma forma y la comparación visual es falsa.
 */
export function dominioCompartido(series: MedicionSerie[]): [number, number] | undefined {
  const valores = series.flatMap((serie) =>
    serie.puntos.flatMap((punto) =>
      punto.minimo !== null && punto.maximo !== null ? [punto.minimo, punto.maximo] : []
    )
  );

  if (valores.length === 0) return undefined;

  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  // Un 5 % de aire arriba y abajo para que las líneas no toquen los bordes.
  const aire = (maximo - minimo) * 0.05 || 1;

  return [minimo - aire, maximo + aire];
}
