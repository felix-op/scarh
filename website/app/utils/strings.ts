/**
 * Formateadores a string para mostrar en pantalla: memoria legible, tiempo legible y
 * conversión de valores de opción a sus etiquetas.
 */
import { segundosAHMS } from "./dates";

function normalizarMemoria(bytes: number = 0): { value: number; unit: string } {
  if (!bytes) return { value: 0, unit: "B" };
  if (bytes >= 1024 ** 3) return { value: bytes / 1024 ** 3, unit: "GB" };
  if (bytes >= 1024 ** 2) return { value: bytes / 1024 ** 2, unit: "MB" };
  if (bytes >= 1024) return { value: bytes / 1024, unit: "KB" };
  return { value: bytes, unit: "B" };
}

/** Convierte bytes en un string legible con la unidad más grande que aplique (ej: "1.5 GB"). */
export function memoriaLegible(bytes: number | null | undefined, decimals = 2): string {
  if (bytes == null) return "-";
  const { value, unit } = normalizarMemoria(bytes);
  return `${parseFloat(value.toFixed(decimals))} ${unit}`;
}

/** Convierte segundos en un string legible (ej: "2 horas y 30 minutos"). */
export function hmsLegibles(totalSegundos: number | null | undefined): string {
  if (totalSegundos == null) return "-";

  const { horas, minutos, segundos } = segundosAHMS(totalSegundos);
  const h = Number(horas);
  const m = Number(minutos);
  const s = Number(segundos);

  const partes: string[] = [];
  if (h > 0) partes.push(`${h} hora${h !== 1 ? "s" : ""}`);
  if (m > 0) partes.push(`${m} minuto${m !== 1 ? "s" : ""}`);
  if (s > 0) partes.push(`${s} segundo${s !== 1 ? "s" : ""}`);

  if (partes.length === 0) return "-";
  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;
  return `${partes[0]}, ${partes[1]} y ${partes[2]}`;
}

/** Mapea una lista de `value`s de opción a sus `label`s, unidos por coma. */
export function valuesToLabels(
  values: string[] | null | undefined,
  opciones: { label: string; value: string }[]
): string {
  if (!values || values.length === 0) return "-";
  return values.map((v) => opciones.find((o) => o.value === v)?.label ?? v).join(", ");
}
