export default function normalizarString(value?: string | number | null) {
	if (value === null || value === undefined) return "";
	const normalized = String(value).trim();
	return normalized || "";
}
