import { format, subHours, subDays } from "date-fns";

/**
 * Retorna las fechas string (yyyy-MM-dd) correspondientes a una ventana de tiempo prestablecida.
 */
export function obtenerFechasVentana(ventana: string): { desde: string; hasta: string } | null {
  const now = new Date();
  const hoyStr = format(now, "yyyy-MM-dd");

  switch (ventana) {
    case "hora":
      return {
        desde: format(subHours(now, 1), "yyyy-MM-dd"),
        hasta: hoyStr,
      };
    case "dia":
      return {
        desde: format(subDays(now, 1), "yyyy-MM-dd"),
        hasta: hoyStr,
      };
    case "semana":
      return {
        desde: format(subDays(now, 7), "yyyy-MM-dd"),
        hasta: hoyStr,
      };
    case "mas_semana":
      return {
        desde: "",
        hasta: format(subDays(now, 7), "yyyy-MM-dd"),
      };
    case "personalizado":
    default:
      return null;
  }
}

export type TiempoDescompuesto = {
  horas?: string | null;
  minutos?: string | null;
  segundos?: string | null;
};

/** Descompone segundos totales en horas/minutos/segundos (strings) para editar. */
export function segundosAHMS(totalSegundos: number | null | undefined): TiempoDescompuesto {
  if (totalSegundos == null) {
    return { horas: null, minutos: null, segundos: null };
  }

  const total = Math.trunc(totalSegundos);

  return {
    horas: String(Math.trunc(total / 3600)),
    minutos: String(Math.trunc(total / 60) % 60),
    segundos: String(total % 60),
  };
}

/** Recompone h/m/s a segundos totales. Devuelve `null` si los tres están vacíos. */
export function hmsASegundos({ horas, minutos, segundos }: TiempoDescompuesto): number | null {
  if (!horas && !minutos && !segundos) {
    return null;
  }

  const h = Number(horas);
  const m = Number(minutos);
  const s = Number(segundos);

  return Math.trunc((isNaN(h) ? 0 : h * 3600) + (isNaN(m) ? 0 : m * 60) + (isNaN(s) ? 0 : s));
}

/**
 * Formatea una fecha como "dd/mm/aaaa hh:mm" (es-AR) o un texto por defecto.
 *
 * **La zona horaria fija no es decorativa: es lo que evita un error de hidratación.**
 * `format()` de date-fns y los `toLocale*` sin `timeZone` usan la zona del runtime, y
 * ésa no es la misma a los dos lados: el contenedor de Next corre en UTC y el navegador
 * en la zona del equipo. El mismo instante daba "20:52" en el HTML del servidor y
 * "17:52" al hidratar, y React descartaba el árbol. Fijando la zona, las dos corridas
 * producen el mismo texto.
 *
 * Además es lo correcto para el dominio: las mediciones son de ríos de Ushuaia, así que
 * la hora que se muestra tiene que ser la de allá, la vea quien la vea.
 *
 * Acepta epoch en milisegundos además de ISO, porque los timestamps de recharts son
 * números.
 */
export function formatFechaHora(
  iso: string | number | null | undefined,
  fallback = "Sin registros"
): string {
  if (iso === null || iso === undefined || iso === "") return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Ushuaia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formatea una fecha como "dd/mm/aaaa" (es-AR) o un texto por defecto. Ver `formatFechaHora`. */
export function formatFecha(iso: string | number | null | undefined, fallback = "-"): string {
  if (iso === null || iso === undefined || iso === "") return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Ushuaia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export type TiempoUltimoDatoBucket = "todos" | "hora" | "dia" | "semana" | "mas_semana";

const UNA_HORA = 60 * 60 * 1000;
const UN_DIA = 24 * UNA_HORA;
const UNA_SEMANA = 7 * UN_DIA;

/**
 * Predicado para el filtro local "tiempo desde el último dato". Los buckets acumulativos
 * (`hora` ⊂ `dia` ⊂ `semana`) filtran por antigüedad de `ultima_conexion`; `mas_semana`
 * incluye también los que no tienen conexión registrada.
 */
export function coincideTiempoUltimoDato(
  ultimaConexion: string | null | undefined,
  bucket: TiempoUltimoDatoBucket,
  now: number = Date.now()
): boolean {
  if (bucket === "todos") return true;

  if (!ultimaConexion) return bucket === "mas_semana";
  const t = new Date(ultimaConexion).getTime();
  if (isNaN(t)) return bucket === "mas_semana";

  const diff = now - t;

  switch (bucket) {
    case "hora":
      return diff <= UNA_HORA;
    case "dia":
      return diff <= UN_DIA;
    case "semana":
      return diff <= UNA_SEMANA;
    case "mas_semana":
      return diff > UNA_SEMANA;
    default:
      return true;
  }
}
