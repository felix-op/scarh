export default function normalizarString(value?: string | null) {
	const normalized = value?.trim();
	return normalized || "-";
}
