import { segundosAHMS } from "./segundosAHMS";

export function hmsLegibles(totalSegundos: number | null | undefined): string {
	if (totalSegundos == null) return "-";

	const { horas, minutos, segundos } = segundosAHMS(totalSegundos);

	const h = Number(horas);
	const m = Number(minutos);
	const s = Number(segundos);

	const partes: string[] = [];

	if (h > 0) {
		partes.push(`${h} hora${h !== 1 ? "s" : ""}`);
	}

	if (m > 0) {
		partes.push(`${m} minuto${m !== 1 ? "s" : ""}`);
	}

	if (s > 0) {
		partes.push(`${s} segundo${s !== 1 ? "s" : ""}`);
	}

	// Si todo es 0
	if (partes.length === 0) return "-";

	// 1 solo valor
	if (partes.length === 1) return partes[0];

	// 2 valores → "A y B"
	if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;

	// 3 valores → "A, B y C"
	return `${partes[0]}, ${partes[1]} y ${partes[2]}`;
}
