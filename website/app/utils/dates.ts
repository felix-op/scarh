/**
 * Helpers de fecha y tiempo: descomposición de segundos en h/m/s, formateo es-AR y
 * el filtro por "tiempo desde el último dato".
 */

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

/** Formatea una fecha ISO como "dd/mm/aaaa hh:mm" (es-AR) o un texto por defecto. */
export function formatFechaHora(iso: string | null | undefined, fallback = "Sin registros"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formatea una fecha ISO como "dd/mm/aaaa" (es-AR) o un texto por defecto. */
export function formatFecha(iso: string | null | undefined, fallback = "-"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
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
