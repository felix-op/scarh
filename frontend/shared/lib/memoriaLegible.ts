import { normalizarMemoria } from "./normalizarMemoria";

export function memoriaLegible(
	bytes: number | null | undefined,
	decimals = 2,
): string {
	if (bytes == null) return "";

	const { value, unit } = normalizarMemoria(bytes);

	// parseFloat para quitar ceros innecesarios, toFixed para decimales
	return `${parseFloat(value.toFixed(decimals))} ${unit}`;
}
