/**
 * Helpers de interfaz de usuario: conversión de memoria para el campo `MemoryField`
 * y utilidades de interacción (debounce).
 */

export type MemoryUnit = "B" | "KB" | "MB" | "GB";
export type MemoryView = { value: number; unit: MemoryUnit };

const MEMORY_MAP: Record<MemoryUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
};

/** Convierte un valor + unidad a bytes. */
export function obtenerMemoria(view: MemoryView): number {
  const numericValue = Number(view.value || 0);
  return numericValue * MEMORY_MAP[view.unit];
}

/**
 * Devuelve `{ value, unit }` sólo si los bytes son múltiplo exacto de la unidad
 * (probando GB→MB→KB→B). Si no lo son, devuelve el valor en bytes. Ideal para
 * inicializar el formulario y que el valor "redondee" bien al editar.
 */
export function normalizarMemoriaExacta(bytes: number = 0): MemoryView {
  if (!bytes) return { value: 0, unit: "B" };

  const unidades: { unit: MemoryUnit; factor: number }[] = [
    { unit: "GB", factor: 1024 ** 3 },
    { unit: "MB", factor: 1024 ** 2 },
    { unit: "KB", factor: 1024 },
    { unit: "B", factor: 1 },
  ];

  for (const { unit, factor } of unidades) {
    if (bytes % factor === 0) {
      return { value: bytes / factor, unit };
    }
  }

  return { value: bytes, unit: "B" };
}

/** Debounce genérico y tipado (sin `any`). */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, delay = 500) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
