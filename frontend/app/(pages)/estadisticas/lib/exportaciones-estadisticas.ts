type CsvCell = string | number | null | undefined;

function normalizeCsvValue(value: CsvCell): string {
	if (value === null || value === undefined) {
		return "";
	}

	if (typeof value === "number") {
		if (!Number.isFinite(value)) {
			return "";
		}

		return value.toLocaleString("es-AR", {
			useGrouping: false,
			maximumFractionDigits: 8,
		});
	}

	return value;
}

function escapeCsvValue(value: CsvCell): string {
	const normalized = normalizeCsvValue(value).replaceAll('"', '""');
	return `"${normalized}"`;
}

export function buildExcelFriendlyCsv(headers: string[], rows: CsvCell[][]): string {
	const headerRow = headers.map(escapeCsvValue).join(";");
	const bodyRows = rows.map((row) => row.map(escapeCsvValue).join(";"));
	return `\uFEFF${[headerRow, ...bodyRows].join("\n")}`;
}

export function buildExcelFriendlyCsvRows(rows: CsvCell[][]): string {
	const bodyRows = rows.map((row) => row.map(escapeCsvValue).join(";"));
	return `\uFEFF${bodyRows.join("\n")}`;
}

export function downloadCsv(fileName: string, headers: string[], rows: CsvCell[][]): void {
	const content = buildExcelFriendlyCsv(headers, rows);
	const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function downloadCsvRows(fileName: string, rows: CsvCell[][]): void {
	const content = buildExcelFriendlyCsvRows(rows);
	const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function buildTimestampedFileName(prefix: string): string {
	const timestamp = new Date()
		.toISOString()
		.replaceAll(":", "-")
		.replace(/\.\d{3}Z$/, "");

	return `${prefix}_${timestamp}.csv`;
}

export function sanitizeFileNamePart(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

export function formatDateForFileName(value: string | number): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "fecha_invalida";
	}

	return date.toISOString().slice(0, 10);
}
