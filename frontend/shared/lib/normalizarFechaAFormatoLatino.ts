export function normalizarFechaAFormatoLatino(
	fecha: string | null | undefined,
): string {
	if (!fecha) return "-";

	const partes = fecha.split("-");

	if (partes.length !== 3) return "-";

	const [anio, mes, dia] = partes;

	return `${dia}/${mes}/${anio}`;
}
