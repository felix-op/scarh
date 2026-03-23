import { TiempoDescompuesto } from "@tipos/Tiempo";

export function segundosAHMS(
	totalSegundos: number | null | undefined,
): TiempoDescompuesto {
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
