import { ImportPreviewRow, ImportRowIssue, MedicionResponse } from "@servicios/api/django.api";

export type ImportMeasurementRow = {
	rowNumber: number;
	limnigrafoId: number | null;
	fechaHora: string;
	alturaAgua: number | null;
	presion: number | null;
	temperatura: number | null;
	nivelBateria: number | null;
};

export type SeriePoint = {
	label: string;
	value: number;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	hour: "2-digit",
	minute: "2-digit",
});

export function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return DATE_FORMATTER.format(date);
}

export function formatTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return TIME_FORMATTER.format(date);
}

export function formatNumber(value: number | null, digits = 2): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "-";
	}
	return value.toFixed(digits);
}

export function parseNumeric(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const normalized = trimWrappingQuotes(trimmed).replace(",", ".");
	const parsed = Number.parseFloat(normalized);
	return Number.isFinite(parsed) ? parsed : null;
}

export function toDatetimeLocalInputValue(date: Date): string {
	const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
	return localDate.toISOString().slice(0, 16);
}

function normalizeHeader(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, "_");
}

function trimWrappingQuotes(value: string): string {
	const trimmed = value.trim();
	if (trimmed.length >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function isEmptyRawValue(value: unknown): boolean {
	return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

function pickRawValue(item: Record<string, unknown>, keys: string[]): unknown {
	for (const key of keys) {
		const raw = item[key];
		if (!isEmptyRawValue(raw)) {
			return raw;
		}
	}
	return undefined;
}

function parseRawDate(raw: unknown): string {
	if (typeof raw !== "string" || !raw.trim()) {
		return "";
	}
	const parsed = new Date(trimWrappingQuotes(raw));
	if (Number.isNaN(parsed.getTime())) {
		return "";
	}
	return parsed.toISOString();
}

function parseRawNumber(raw: unknown): number | null {
	if (typeof raw === "number") {
		return Number.isFinite(raw) ? raw : null;
	}
	if (typeof raw === "string") {
		return parseNumeric(raw);
	}
	return null;
}

function createIssue(field: string, code: string, message: string): ImportRowIssue {
	return { field, code, message };
}

function buildPreviewRow(item: Record<string, unknown>, rowNumber: number): ImportPreviewRow {
	const limnigrafo = parseRawNumber(
		pickRawValue(item, [
			"limnigrafo",
			"limnigrafo_id",
			"limnigrafoid",
			"limnigrafoId",
			"id_limnigrafo",
			"idLimnigrafo",
		]),
	);
	const fechaHora = parseRawDate(
		pickRawValue(item, ["fecha_hora", "fechaHora", "fecha", "fecha_utc"]),
	);
	const alturaAgua = parseRawNumber(
		pickRawValue(item, ["altura_agua", "altura", "alturaagua", "alturaAgua"]),
	);
	const presion = parseRawNumber(pickRawValue(item, ["presion"]));
	const temperatura = parseRawNumber(pickRawValue(item, ["temperatura"]));
	const nivelBateria = parseRawNumber(
		pickRawValue(item, ["nivel_de_bateria", "nivelBateria", "bateria", "battery"]),
	);

	const issues: ImportRowIssue[] = [];
	if (!fechaHora) {
		issues.push(createIssue("fecha_hora", "required", "La fecha y hora es obligatoria."));
	}
	if (alturaAgua === null) {
		issues.push(createIssue("altura_agua", "required", "La altura del agua es obligatoria."));
	}
	if (limnigrafo !== null && !Number.isInteger(limnigrafo)) {
		issues.push(createIssue("limnigrafo_id", "invalid", "El limnígrafo debe ser un entero válido."));
	}

	return {
		rowNumber,
		limnigrafoId: limnigrafo !== null ? Math.trunc(limnigrafo) : null,
		fechaHora,
		alturaAgua,
		presion,
		temperatura,
		nivelBateria,
		status: issues.length > 0 ? "error" : "valid",
		issues,
	};
}

function parseJsonImport(content: string): ImportPreviewRow[] {
	const parsed = JSON.parse(content);
	const rows = Array.isArray(parsed) ? parsed : [parsed];

	return rows
		.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
		.map((item, index) => buildPreviewRow(item, index + 1));
}

function parseCsvImport(content: string): ImportPreviewRow[] {
	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => Boolean(line) && !line.startsWith("#"));

	if (lines.length < 2) {
		return [];
	}

	const headers = parseCsvLine(lines[0]).map(normalizeHeader);
	const rows: ImportPreviewRow[] = [];

	for (let index = 1; index < lines.length; index += 1) {
		const values = parseCsvLine(lines[index]);
		const item: Record<string, string> = {};

		headers.forEach((header, headerIndex) => {
			item[header] = values[headerIndex] ?? "";
		});

		rows.push(buildPreviewRow(item, index + 1));
	}

	return rows;
}

function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const nextChar = line[index + 1];

		if (char === "\"") {
			if (inQuotes && nextChar === "\"") {
				current += "\"";
				index += 1;
				continue;
			}

			inQuotes = !inQuotes;
			continue;
		}

		if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
			continue;
		}

		current += char;
	}

	values.push(current.trim());
	return values.map(trimWrappingQuotes);
}

function markDuplicateRows(rows: ImportPreviewRow[]): ImportPreviewRow[] {
	const keyToCount = new Map<string, number>();

	rows.forEach((row) => {
		if (row.limnigrafoId === null || !row.fechaHora) {
			return;
		}
		const key = `${row.limnigrafoId}::${row.fechaHora}`;
		keyToCount.set(key, (keyToCount.get(key) ?? 0) + 1);
	});

	return rows.map((row) => {
		if (row.limnigrafoId === null || !row.fechaHora) {
			return row;
		}

		const key = `${row.limnigrafoId}::${row.fechaHora}`;
		if ((keyToCount.get(key) ?? 0) <= 1) {
			return row;
		}

		const alreadyMarked = row.issues.some((issue) => issue.code === "duplicate_file");
		const issues = alreadyMarked
			? row.issues
			: [
				...row.issues,
				createIssue(
					"fecha_hora",
					"duplicate_file",
					"Ya existe otra fila en el archivo con el mismo limnígrafo y fecha/hora.",
				),
			];

		return {
			...row,
			status: "duplicate_file",
			issues,
		};
	});
}

export function parseImportRowsByFilename(content: string, fileName: string): ImportPreviewRow[] {
	const lowerName = fileName.toLowerCase();
	let rows: ImportPreviewRow[] = [];

	if (lowerName.endsWith(".json")) {
		rows = parseJsonImport(content);
		return markDuplicateRows(rows);
	}
	if (lowerName.endsWith(".csv")) {
		rows = parseCsvImport(content);
		return markDuplicateRows(rows);
	}

	const fromJson = parseJsonImport(content);
	if (fromJson.length > 0) {
		return markDuplicateRows(fromJson);
	}

	return markDuplicateRows(parseCsvImport(content));
}

export function applyFallbackLimnigrafo(
	rows: ImportPreviewRow[],
	fallbackLimnigrafoId: number | null,
): ImportPreviewRow[] {
	return rows.map((row) => {
		if (row.limnigrafoId !== null) {
			return row;
		}

		const baseIssues = row.issues.filter((issue) => issue.code !== "missing_fallback");
		if (fallbackLimnigrafoId !== null) {
			return {
				...row,
				status: baseIssues.length > 0 ? "error" : "valid",
				issues: baseIssues,
			};
		}

		return {
			...row,
			status: row.status === "duplicate_file" ? row.status : "warning",
			issues: [
				...baseIssues,
				createIssue(
					"limnigrafo_id",
					"missing_fallback",
					"Definí un limnígrafo por defecto o completá el limnígrafo en la fila.",
				),
			],
		};
	});
}

export function buildImportRequestRows(rows: ImportPreviewRow[]) {
	return rows.map((row) => ({
		row_number: row.rowNumber,
		limnigrafo_id: row.limnigrafoId,
		fecha_hora: row.fechaHora,
		altura_agua: row.alturaAgua,
		presion: row.presion,
		temperatura: row.temperatura,
		nivel_de_bateria: row.nivelBateria,
	}));
}

export function buildSerie(
	mediciones: MedicionResponse[],
	pickValue: (medicion: MedicionResponse) => number | null,
	maxPoints = 30,
): SeriePoint[] {
	const ordered = [...mediciones]
		.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
		.slice(-maxPoints);

	return ordered
		.map((medicion) => {
			const value = pickValue(medicion);
			if (value === null || value === undefined || Number.isNaN(value)) {
				return null;
			}

			return {
				label: formatTime(medicion.fecha_hora),
				value,
			};
		})
		.filter((item): item is SeriePoint => item !== null);
}

export function buildCsvContent(
	mediciones: MedicionResponse[],
	limnigrafoNameById: Map<number, string>,
): string {
	const headers = [
		"id",
		"limnigrafo_id",
		"limnigrafo",
		"fecha_hora",
		"fuente",
		"altura_agua",
		"presion",
		"temperatura",
		"nivel_de_bateria",
	];

	const rows = mediciones.map((medicion) => {
		const limnigrafoNombre = limnigrafoNameById.get(medicion.limnigrafo) ?? String(medicion.limnigrafo);
		return [
			String(medicion.id),
			String(medicion.limnigrafo),
			limnigrafoNombre,
			medicion.fecha_hora,
			medicion.fuente,
			medicion.altura_agua ?? "",
			medicion.presion ?? "",
			medicion.temperatura ?? "",
			medicion.nivel_de_bateria ?? "",
		]
			.map((value) => {
				const safeValue = String(value).replaceAll('"', '""');
				return `"${safeValue}"`;
			})
			.join(",");
	});

	return [headers.join(","), ...rows].join("\n");
}

export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
