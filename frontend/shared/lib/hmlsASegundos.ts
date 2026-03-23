import { TiempoDescompuesto } from "@tipos/Tiempo";

export function hmsASegundos({
	horas,
	minutos,
	segundos,
}: TiempoDescompuesto): number | null {
	if (!horas && !minutos && !segundos) {
		return null;
	}

	const h = Number(horas);
	const m = Number(minutos);
	const s = Number(segundos);

	return Math.trunc(
		(isNaN(h) ? 0 : h * 3600) +
			(isNaN(m) ? 0 : m * 60) +
			(isNaN(s) ? 0 : s),
	);
}
