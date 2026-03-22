import { MemoryUnit, MemoryView } from "@tipos/Memoria";

const MEMORY_MAP: Record<MemoryUnit, number> = {
	B: 1,
	KB: 1024,
	MB: 1024 ** 2,
	GB: 1024 ** 3,
};

export function obtenerMemoria(view: MemoryView): number {
	const numericValue = Number(view.value || 0);
	return numericValue * MEMORY_MAP[view.unit];
}
