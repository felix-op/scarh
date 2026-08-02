import { ZONA_PROYECTO } from "./estadisticas.utiles";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/**
 * Franja del día. Los cortes siguen el uso rioplatense: "buenas tardes" arranca al
 * mediodía y "buenas noches" recién cuando ya oscureció, no a las 18.
 */
type Franja = "madrugada" | "manana" | "tarde" | "noche";

function franjaDe(hora: number): Franja {
  if (hora < 5) return "madrugada";
  if (hora < 12) return "manana";
  if (hora < 20) return "tarde";
  return "noche";
}

/**
 * Plantillas por franja. `{nombre}` y `{dia}` se reemplazan al armar el saludo.
 *
 * Ninguna afirma nada sobre el estado del sistema —nada de "todo tranquilo"— porque
 * esto es una pantalla de monitoreo: un saludo optimista arriba de un sensor caído
 * contradice a la propia pantalla.
 */
const PLANTILLAS: Record<Franja, string[]> = {
  madrugada: [
    "¡Buenas noches, {nombre}!",
    "Guardia nocturna, {nombre}",
    "A esta hora también, {nombre}",
  ],
  manana: [
    "¡Buenos días, {nombre}!",
    "¡Feliz {dia}, {nombre}!",
    "¿Cómo amaneció el río, {nombre}?",
    "Buen día, {nombre}",
  ],
  tarde: [
    "¡Buenas tardes, {nombre}!",
    "¡Feliz {dia}, {nombre}!",
    "¿Cómo va la tarde, {nombre}?",
    "Buenas, {nombre}",
  ],
  noche: [
    "¡Buenas noches, {nombre}!",
    "Cerrando el {dia}, {nombre}",
    "Buenas, {nombre}",
  ],
};

/** Saludos que reemplazan al genérico en días puntuales. */
const POR_DIA: Record<number, string[]> = {
  1: ["Arranca la semana, {nombre}", "¡Feliz lunes, {nombre}!"],
  5: ["¡Buen viernes, {nombre}!", "Se viene el finde, {nombre}"],
  6: ["¡Buen finde, {nombre}!"],
  0: ["¡Buen domingo, {nombre}!", "¡Buen finde, {nombre}!"],
};

/**
 * Hash estable de un texto. No necesita ser criptográfico: sólo repartir de forma
 * pareja y dar siempre el mismo número para la misma entrada.
 */
function hash(texto: string): number {
  let acumulado = 0;
  for (let i = 0; i < texto.length; i += 1) {
    acumulado = (acumulado * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return acumulado;
}

/**
 * Saludo del tablero.
 *
 * La franja horaria decide **qué** saludos aplican; `semilla` decide cuál de ellos
 * sale. Quien la provee gobierna cada cuánto cambia: la pantalla de inicio le pasa
 * la marca de tiempo del request, de modo que cada carga trae uno distinto.
 *
 * Que no cambie durante el refresco automático es responsabilidad del componente
 * que lo muestra, no de esta función: `Saludo` congela el primero que recibe.
 *
 * La hora se lee en la zona del proyecto y no en la del entorno: el contenedor de
 * Next corre en UTC, tres horas adelantado, y a las 19 de Ushuaia saludaría con
 * "buenas noches".
 *
 * @param nombre Nombre a saludar.
 * @param fecha Instante de referencia. Por defecto, ahora.
 * @param semilla Determina cuál de los saludos aplicables sale. Con la misma
 *   semilla y la misma franja, el resultado es siempre el mismo.
 */
export function obtenerSaludo(nombre: string, fecha: Date = new Date(), semilla = 0): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_PROYECTO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(fecha);

  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? "";

  const hora = Number(valor("hour")) % 24;
  const dia = `${valor("year")}-${valor("month")}-${valor("day")}`;
  const franja = franjaDe(hora);

  // El día de la semana en la zona del proyecto, no el del runtime.
  const indiceDia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(valor("weekday"));

  // Los saludos del día sólo entran fuera de la madrugada: a las 3 AM del lunes,
  // "arranca la semana" suena a broma.
  const opciones = [
    ...PLANTILLAS[franja],
    ...(franja !== "madrugada" ? POR_DIA[indiceDia] ?? [] : []),
  ];

  const elegida = opciones[hash(`${dia}-${franja}-${semilla}`) % opciones.length];

  return elegida
    .replace("{nombre}", nombre)
    .replace("{dia}", DIAS[indiceDia] ?? "día");
}
