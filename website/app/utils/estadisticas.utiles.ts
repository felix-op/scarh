import type { AgrupacionEstadistica, EstadisticaFila } from "@models";
import { AGRUPACION_METADATA, VENTANAS_ESTADISTICAS } from "./constantes-estadisticas";

/**
 * Zona horaria en la que el backend interpreta las fechas sin offset y agrupa los
 * períodos (`TIME_ZONE` de Django).
 *
 * El frontend la usa explícitamente en lugar de confiar en la del entorno: el
 * contenedor de Next corre en UTC, así que `new Date()` formateado "en local"
 * daría un día distinto al que agrupa el backend durante las últimas 3 horas de
 * cada jornada.
 */
export const ZONA_PROYECTO = "America/Argentina/Buenos_Aires";

/** Formato de las fechas que viajan en la URL y en los filtros. */
export const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const formateadorZona = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_PROYECTO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * Formatea un instante como fecha y hora **sin offset** en la zona del proyecto
 * (`yyyy-MM-ddTHH:mm:ss`).
 *
 * Se manda así a propósito: Django recibe el naive y lo interpreta en su propia
 * `TIME_ZONE`, que es la misma, de modo que "1 de enero" significa lo mismo en
 * los dos extremos sin importar dónde corra el frontend.
 */
export function aFechaHoraLocal(fecha: Date): string {
  const partes = Object.fromEntries(
    formateadorZona.formatToParts(fecha).map((parte) => [parte.type, parte.value])
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}`;
}

/** Fecha (sin hora) del instante dado, en la zona del proyecto (`yyyy-MM-dd`). */
export function aFechaLocal(fecha: Date): string {
  return aFechaHoraLocal(fecha).slice(0, 10);
}

/**
 * Resuelve una ventana rápida a un rango concreto de fechas.
 *
 * @param ventana Valor de `VENTANAS_ESTADISTICAS`.
 * @returns `{ desde, hasta }` en `yyyy-MM-dd`, o `null` si la ventana es
 *   `personalizado` (el rango lo elige el usuario).
 */
export function obtenerRangoVentana(ventana: string): { desde: string; hasta: string } | null {
  const opcion = VENTANAS_ESTADISTICAS.find((item) => item.value === ventana);
  if (!opcion?.dias) return null;

  const ahora = new Date();
  const inicio = new Date(ahora.getTime() - opcion.dias * 24 * 60 * 60 * 1000);

  return { desde: aFechaLocal(inicio), hasta: aFechaLocal(ahora) };
}

/**
 * Convierte el rango de la UI (dos fechas `yyyy-MM-dd`) en los límites que espera
 * el endpoint. El día final se incluye completo.
 */
export function limitesDelRango(desde: string, hasta: string): { fecha_inicio: string; fecha_fin: string } {
  return {
    fecha_inicio: `${desde}T00:00:00`,
    fecha_fin: `${hasta}T23:59:59`,
  };
}


const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Etiqueta visible de una fila de la tabla.
 *
 * En agrupación por período se construye a partir de `clave` y de la porción de
 * fecha de `periodo_inicio`, sin instanciar `Date`: esos strings ya vienen
 * expresados en la zona del proyecto, y parsearlos los reinterpretaría en la zona
 * del runtime, corriendo la etiqueta un día.
 */
export function etiquetaDeFila(fila: EstadisticaFila, agrupacion: AgrupacionEstadistica): string {
  if (agrupacion === "dispositivo") return fila.etiqueta;

  const [anio, mes, dia] = fila.clave.split("-");

  switch (agrupacion) {
    case "dia":
      return `${dia}/${mes}/${anio}`;
    case "mes":
      return `${MESES[Number(mes) - 1]} ${anio}`;
    case "anio":
      return anio;
    case "semana": {
      const semana = mes.replace("W", "");
      const rango = rangoDeSemana(fila.periodo_inicio);
      return rango ? `Sem. ${semana} · ${rango}` : `Semana ${semana} de ${anio}`;
    }
    default:
      return fila.etiqueta;
  }
}

/** Rango `dd/MM – dd/MM` de la semana que arranca en `periodoInicio`. */
function rangoDeSemana(periodoInicio: string | null): string | null {
  if (!periodoInicio) return null;

  const [anio, mes, dia] = periodoInicio.slice(0, 10).split("-").map(Number);
  // `Date.UTC` resuelve el desborde de mes; se usa UTC para que los getters no
  // dependan de la zona del runtime.
  const fin = new Date(Date.UTC(anio, mes - 1, dia + 6));

  const dd = String(fin.getUTCDate()).padStart(2, "0");
  const mm = String(fin.getUTCMonth() + 1).padStart(2, "0");

  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")} – ${dd}/${mm}`;
}

/** Rótulo de la primera columna de la tabla, según qué representa cada fila. */
export function encabezadoPrimeraColumna(agrupacion: AgrupacionEstadistica): string {
  return AGRUPACION_METADATA[agrupacion].columna;
}

/**
 * Convierte una fecha `yyyy-MM-dd` en el `Date` que espera el calendario.
 *
 * Se arma por componentes y no parseando el string porque el parser de `Date`
 * cambia de semántica según el formato: `"2026-01-15"` se interpreta en **UTC**
 * mientras `"2026-01-15T00:00:00"` se interpreta en hora **local**. Con la segunda
 * forma el ida y vuelta es correcto, pero queda a un carácter de distancia de
 * correrse un día entero, y el error sería invisible salvo en zonas negativas.
 */
export function aDateDesdeFecha(fecha: string): Date | undefined {
  if (!FORMATO_FECHA.test(fecha)) return undefined;

  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

/**
 * Inversa de `aDateDesdeFecha`: lee los componentes locales del `Date` que
 * devuelve el calendario. El ida y vuelta no depende de la zona horaria porque
 * ambos extremos usan los mismos getters locales.
 */
export function aFechaDesdeDate(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
