import type { AtributoEstadistica } from "@models";

/**
 * Metadatos de presentación de cada variable que mide un limnígrafo.
 *
 * Vive acá y no en las constantes de estadísticas porque **no es dato de esa
 * pantalla**: es dato del dominio, y lo consumen por igual la tabla de mediciones,
 * la previsualización de importación, la ficha del limnígrafo, la tarjeta del mapa
 * y los gráficos. Antes cada uno escribía la unidad a mano y la app se contradecía
 * sola: la misma medición se leía "63.2 cm" en una pantalla y "63.20 m" en otra.
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
  // Centímetros, no metros, y con 1 decimal: es lo que mide y reporta el equipo, y
  // nada convierte en ningún punto de la cadena (`docs/roadmaps/roadmap-simulador.md` §A.3.5,
  // verificado sobre 4744 registros reales). Rotularlo "m" mostraba un arroyo de
  // 63 cm como 63 metros.
  altura_agua: { label: "Nivel del agua", unidad: "cm", decimales: 1 },
  presion: {
    label: "Presión hidrostática",
    unidad: "hPa",
    decimales: 2,
    aclaracion:
      "Presión ejercida por la columna de agua sobre el sensor. No es presión atmosférica: " +
      "es presión relativa, del orden de 0 a 200 hPa.",
  },
  temperatura: { label: "Temperatura", unidad: "°C", decimales: 2 },
  // Volts, no porcentaje: el dispositivo reporta tensión de batería (las fixtures
  // traen `bateria_min: 10.5` y `bateria_max: 13.0`). Con "%" una batería sana se
  // mostraba como "12.4 %", es decir casi descargada.
  nivel_de_bateria: { label: "Tensión de batería", unidad: "V", decimales: 2 },
};

/**
 * Formatea el valor de una medición con la unidad y los decimales de su variable.
 *
 * Es el **único** formateador de valores medidos de la aplicación. Antes había cinco
 * casi iguales repartidos por los componentes, y no daban el mismo resultado: unos
 * redondeaban con `toFixed` y otros interpolaban el float crudo, así que el mismo
 * dato podía salir como `63.2` o como `63.20000000001` según la pantalla.
 *
 * Devuelve `-` cuando el valor falta. Eso es deliberado y significa **ausencia de
 * medición**, que no es lo mismo que un cero medido.
 *
 * @param valor Valor a mostrar.
 * @param atributo Variable, que define unidad y decimales.
 * @param conUnidad `false` para obtener sólo el número (columnas de tabla que ya
 *   declaran la unidad en el encabezado, o celdas exportadas a CSV).
 */
export function formatearMedicion(
  valor: number | null | undefined,
  atributo: AtributoEstadistica,
  { conUnidad = true }: { conUnidad?: boolean } = {}
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "-";

  const { unidad, decimales } = ATRIBUTO_METADATA[atributo];
  const numero = valor.toFixed(decimales);
  return conUnidad && unidad ? `${numero} ${unidad}` : numero;
}

/** Etiqueta con unidad para encabezados de columna: `Nivel del agua (cm)`. */
export function etiquetaConUnidad(atributo: AtributoEstadistica): string {
  const { label, unidad } = ATRIBUTO_METADATA[atributo];
  return unidad ? `${label} (${unidad})` : label;
}

/** Umbrales de batería de `ConfiguracionLimnigrafo`, que es lo único que define el 0 % y el 100 %. */
export type UmbralesBateria = { bateria_min: number | null; bateria_max: number | null };

/**
 * Estima el porcentaje de carga a partir de la tensión medida, interpolando
 * linealmente entre `bateria_min` (0 %) y `bateria_max` (100 %).
 *
 * Devuelve `null` cuando no se puede estimar, y ese caso **no es un error**: el
 * equipo no tiene forma de saber cuál es su batería llena. El firmware sólo
 * reporta tensión (`Bat()` en `recursos/limnigrafo-firmware.ino`, con un decimal),
 * así que el 100 % sale siempre de la configuración que carga un operador. Sin
 * `bateria_max` no hay porcentaje posible y hay que mostrar los volts.
 *
 * La interpolación es lineal y la curva de descarga real no lo es (una batería de
 * plomo-ácido se mantiene plana en el medio del rango y después cae de golpe), así
 * que el resultado se redondea a entero: es una estimación, no una medición, y no
 * conviene darle decimales que aparenten una precisión inexistente.
 */
export function porcentajeBateria(
  volts: number | null | undefined,
  umbrales: UmbralesBateria | null | undefined
): number | null {
  if (volts === null || volts === undefined || Number.isNaN(volts)) return null;

  const minimo = umbrales?.bateria_min;
  const maximo = umbrales?.bateria_max;
  if (minimo === null || minimo === undefined || maximo === null || maximo === undefined) return null;
  // Un rango invertido o de ancho cero es config inválida, no un 0 % ni una división por cero.
  if (maximo <= minimo) return null;

  const bruto = ((volts - minimo) / (maximo - minimo)) * 100;
  return Math.round(Math.min(100, Math.max(0, bruto)));
}

/**
 * Batería para las pantallas de estado: `78 % (12.40 V)`, o sólo los volts cuando
 * no hay umbrales configurados. El voltaje queda siempre a la vista porque es el
 * único número que el equipo midió de verdad.
 *
 * No usar en la tabla de mediciones ni en las exportaciones: ahí el porcentaje
 * sería un valor derivado de una configuración de hoy aplicada a filas viejas, y
 * cambiaría solo al editar `bateria_max`.
 */
export function formatearBateria(
  volts: number | null | undefined,
  umbrales: UmbralesBateria | null | undefined
): string {
  const voltaje = formatearMedicion(volts, "nivel_de_bateria");
  const porcentaje = porcentajeBateria(volts, umbrales);
  return porcentaje === null ? voltaje : `${porcentaje} % (${voltaje})`;
}
