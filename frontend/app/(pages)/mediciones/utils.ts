import { MedicionResponse } from "@servicios/api/django.api";

export type ParsedMedicionImportRow = {
	fecha_hora?: string;
	altura_agua: number;
	presion: number | null;
	temperatura: number | null;
	nivel_de_bateria: number | null;
	limnigrafo?: number;
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

function parseRawDate(raw: unknown): string | undefined {
	if (typeof raw !== "string" || !raw.trim()) {
		return undefined;
	}
	const parsed = new Date(trimWrappingQuotes(raw));
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
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

function mapRawImportObject(item: Record<string, unknown>): ParsedMedicionImportRow | null {
	const altura = parseRawNumber(
		pickRawValue(item, ["altura_agua", "altura", "alturaagua", "alturaAgua"]),
	);
	if (altura === null) {
		return null;
	}

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

	return {
		fecha_hora: fechaHora,
		altura_agua: altura,
		presion: parseRawNumber(pickRawValue(item, ["presion"])),
		temperatura: parseRawNumber(pickRawValue(item, ["temperatura"])),
		nivel_de_bateria: parseRawNumber(
			pickRawValue(item, ["nivel_de_bateria", "nivelBateria", "bateria", "battery"]),
		),
		limnigrafo: limnigrafo !== null ? Math.trunc(limnigrafo) : undefined,
	};
}

function parseJsonImport(content: string): ParsedMedicionImportRow[] {
	const parsed = JSON.parse(content);
	const rows = Array.isArray(parsed) ? parsed : [parsed];

	return rows
		.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
		.map(mapRawImportObject)
		.filter((item): item is ParsedMedicionImportRow => item !== null);
}

function parseCsvImport(content: string): ParsedMedicionImportRow[] {
	const lines = content
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => Boolean(line) && !line.startsWith("#"));

	if (lines.length < 2) {
		return [];
	}

	const headers = parseCsvLine(lines[0]).map(normalizeHeader);
	const rows: ParsedMedicionImportRow[] = [];

	for (let index = 1; index < lines.length; index += 1) {
		const values = parseCsvLine(lines[index]);
		const item: Record<string, string> = {};

		headers.forEach((header, headerIndex) => {
			item[header] = values[headerIndex] ?? "";
		});

		const mapped = mapRawImportObject(item);
		if (mapped) {
			rows.push(mapped);
		}
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

export function parseImportRowsByFilename(content: string, fileName: string): ParsedMedicionImportRow[] {
	const lowerName = fileName.toLowerCase();

	if (lowerName.endsWith(".json")) {
		return parseJsonImport(content);
	}
	if (lowerName.endsWith(".csv")) {
		return parseCsvImport(content);
	}

	const fromJson = parseJsonImport(content);
	if (fromJson.length > 0) {
		return fromJson;
	}

	return parseCsvImport(content);
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
