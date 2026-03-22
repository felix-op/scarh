import { MemoryView } from "@tipos/Memoria";

export function normalizarMemoria(bytes: number = 0): MemoryView {
	if (!bytes) return { value: 0, unit: "B" };

	if (bytes >= 1024 ** 3) return { value: bytes / 1024 ** 3, unit: "GB" };

	if (bytes >= 1024 ** 2) return { value: bytes / 1024 ** 2, unit: "MB" };

	if (bytes >= 1024) return { value: bytes / 1024, unit: "KB" };

	return { value: bytes, unit: "B" };
}
