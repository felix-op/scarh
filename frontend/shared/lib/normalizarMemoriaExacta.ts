import { MemoryView } from "@tipos/Memoria";

/**
 * Devuelve { value, unit } solo si los bytes son múltiplo exacto de la unidad.
 * Si no, devuelve { value: bytes, unit: 'B' } sin convertir.
 */
export function normalizarMemoriaExacta(bytes: number = 0): MemoryView {
	if (!bytes) return { value: 0, unit: "B" };

	const unidades: { unit: MemoryView["unit"]; factor: number }[] = [
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

	// No es múltiplo exacto → devolver en bytes
	return { value: bytes, unit: "B" };
}
