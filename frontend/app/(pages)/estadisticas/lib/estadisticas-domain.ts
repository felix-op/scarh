import {
	type MedicionPaginatedResponse,
	type MedicionResponse,
} from "@servicios/api/django.api";
import { toDatetimeLocalInputValue } from "../../mediciones/utils";

export const FETCH_PAGE_SIZE = 1000;
export const MAX_FETCH_ROWS = 20000;
export const REALTIME_REFRESH_MS = 30000;
export const MIN_RATE_INTERVAL_MS = 60 * 1000;
// Umbral de z-score robusto (MAD) para descartar picos de tasa irrealmente altos o bajos.
export const RATE_MAD_Z_THRESHOLD = 6;

export type EstadisticaAtributo = "altura_agua" | "presion" | "temperatura";
export type ModoFiltro = "realtime" | "rango";
export type VentanaRealtime = "1h" | "6h" | "24h" | "7d" | "30d" | "90d";
export type EstadisticasTab = "graficos" | "tabla";

export type EstadisticasFilters = {
	atributo: EstadisticaAtributo;
	modo: ModoFiltro;
	ventana: VentanaRealtime;
	desde: string;
	hasta: string;
	limnigrafos: string[];
};

export type TablaComparativaFilters = {
	atributo: EstadisticaAtributo;
	desde: string;
	hasta: string;
	limnigrafos: string[];
};

export type ActiveRange = {
	currentFrom: number;
	currentTo: number;
	previousFrom: number;
	previousTo: number;
};

export type ParsedMedicion = MedicionResponse & {
	timestamp: number;
};

export type Summary = {
	registros: number;
	promedio: number | null;
	minimo: number | null;
	maximo: number | null;
	desvio: number | null;
	p90: number | null;
};

export const ATRIBUTO_METADATA: Record<EstadisticaAtributo, { label: string; unit: string; decimals: number }> = {
	altura_agua: {
		label: "Nivel del agua",
		unit: "m",
		decimals: 2,
	},
	presion: {
		label: "Presión atmosférica",
		unit: "hPa",
		decimals: 2,
	},
	temperatura: {
		label: "Temperatura",
		unit: "°C",
		decimals: 2,
	},
};

export const REALTIME_WINDOW_LABELS: Record<VentanaRealtime, string> = {
	"1h": "Última hora",
	"6h": "Últimas 6 horas",
	"24h": "Últimas 24 horas",
	"7d": "Últimos 7 días",
	"30d": "Últimos 30 días",
	"90d": "Últimos 90 días",
};

export function getDefaultDateRange() {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
	};
}

export function getDefaultFilters(): EstadisticasFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		atributo: "altura_agua",
		modo: "realtime",
		ventana: "24h",
		desde,
		hasta,
		limnigrafos: [],
	};
}

export function getDefaultTablaComparativaFilters(): TablaComparativaFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		atributo: "altura_agua",
		desde,
		hasta,
		limnigrafos: [],
	};
}

export function toIsoString(value: string): string | null {
	if (!value) {
		return null;
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return parsed.toISOString();
}

export function getWindowDurationMs(window: VentanaRealtime): number {
	if (window === "1h") {
		return 60 * 60 * 1000;
	}
	if (window === "6h") {
		return 6 * 60 * 60 * 1000;
	}
	if (window === "24h") {
		return 24 * 60 * 60 * 1000;
	}
	if (window === "7d") {
		return 7 * 24 * 60 * 60 * 1000;
	}
	if (window === "30d") {
		return 30 * 24 * 60 * 60 * 1000;
	}
	return 90 * 24 * 60 * 60 * 1000;
}

export function resolveCurrentRange(filters: EstadisticasFilters, reference: Date): { from: Date; to: Date } {
	if (filters.modo === "realtime") {
		const to = new Date(reference);
		const from = new Date(to.getTime() - getWindowDurationMs(filters.ventana));
		return { from, to };
	}

	const fromIso = toIsoString(filters.desde);
	const toIso = toIsoString(filters.hasta);

	if (!fromIso || !toIso) {
		const to = new Date(reference);
		const from = new Date(to.getTime() - getWindowDurationMs("24h"));
		return { from, to };
	}

	const from = new Date(fromIso);
	const to = new Date(toIso);
	if (from.getTime() >= to.getTime()) {
		const safeTo = new Date(reference);
		const safeFrom = new Date(safeTo.getTime() - getWindowDurationMs("24h"));
		return { from: safeFrom, to: safeTo };
	}

	return { from, to };
}

export function getMedicionValueByAtributo(medicion: MedicionResponse, atributo: EstadisticaAtributo): number | null {
	if (atributo === "altura_agua") {
		return medicion.altura_agua;
	}
	if (atributo === "presion") {
		return medicion.presion;
	}
	return medicion.temperatura;
}

export function formatMetricValue(value: number | null, atributo: EstadisticaAtributo): string {
	if (value === null || Number.isNaN(value)) {
		return "-";
	}

	const { decimals, unit } = ATRIBUTO_METADATA[atributo];
	return `${value.toFixed(decimals)} ${unit}`;
}

export function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}

	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

export function computePercentile(values: number[], percentile: number): number | null {
	if (values.length === 0) {
		return null;
	}

	const sorted = [...values].sort((a, b) => a - b);
	const k = ((sorted.length - 1) * percentile) / 100;
	const floor = Math.floor(k);
	const ceil = Math.ceil(k);

	if (floor === ceil) {
		return sorted[floor];
	}

	const d0 = sorted[floor] * (ceil - k);
	const d1 = sorted[ceil] * (k - floor);
	return d0 + d1;
}

export function computeSummary(values: number[]): Summary {
	if (values.length === 0) {
		return {
			registros: 0,
			promedio: null,
			minimo: null,
			maximo: null,
			desvio: null,
			p90: null,
		};
	}

	const promedio = values.reduce((acc, current) => acc + current, 0) / values.length;
	const minimo = Math.min(...values);
	const maximo = Math.max(...values);
	const p90 = computePercentile(values, 90);
	const variance = values.reduce((acc, current) => acc + ((current - promedio) ** 2), 0) / values.length;
	const desvio = Math.sqrt(variance);

	return {
		registros: values.length,
		promedio,
		minimo,
		maximo,
		desvio,
		p90,
	};
}

export function getRateBucketSizeMs(durationMs: number): number {
	if (durationMs <= 2 * 60 * 60 * 1000) {
		return 60 * 1000;
	}
	if (durationMs <= 6 * 60 * 60 * 1000) {
		return 2 * 60 * 1000;
	}
	if (durationMs <= 24 * 60 * 60 * 1000) {
		return 5 * 60 * 1000;
	}
	if (durationMs <= 7 * 24 * 60 * 60 * 1000) {
		return 15 * 60 * 1000;
	}
	if (durationMs <= 30 * 24 * 60 * 60 * 1000) {
		return 60 * 60 * 1000;
	}
	return 3 * 60 * 60 * 1000;
}

export function formatDateTick(value: string, durationMs: number): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	if (durationMs <= 24 * 60 * 60 * 1000) {
		return date.toLocaleTimeString("es-AR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	if (durationMs <= 7 * 24 * 60 * 60 * 1000) {
		return date.toLocaleDateString("es-AR", {
			month: "short",
			day: "2-digit",
			hour: "2-digit",
		});
	}

	return date.toLocaleDateString("es-AR", {
		month: "short",
		day: "2-digit",
	});
}

export function formatDateTime(value: number | string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return date.toLocaleString("es-AR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatVariation(value: number | null): string {
	if (value === null || !Number.isFinite(value)) {
		return "Sin base de comparación";
	}

	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(2)} % vs período previo`;
}

function extractErrorMessage(payload: unknown): string {
	if (typeof payload === "string" && payload.trim()) {
		return payload;
	}

	if (payload && typeof payload === "object") {
		const candidate = payload as Record<string, unknown>;
		const detail = candidate.detail;
		const error = candidate.error;
		if (typeof detail === "string" && detail.trim()) {
			return detail;
		}
		if (typeof error === "string" && error.trim()) {
			return error;
		}
	}

	return "No se pudieron cargar las mediciones para estadísticas.";
}

export async function fetchAllMedicionesForStats(queryParams: Record<string, string>): Promise<MedicionResponse[]> {
	let page = 1;
	let allRows: MedicionResponse[] = [];

	while (true) {
		const currentParams = new URLSearchParams({
			...queryParams,
			limit: String(FETCH_PAGE_SIZE),
			page: String(page),
		});

		const response = await fetch(`/api/proxy/medicion/?${currentParams.toString()}`, {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			throw new Error(extractErrorMessage(errorBody));
		}

		const payload = (await response.json()) as MedicionPaginatedResponse;
		allRows = allRows.concat(payload.results ?? []);

		if (!payload.next || allRows.length >= MAX_FETCH_ROWS) {
			break;
		}

		page += 1;
	}

	return allRows;
}
