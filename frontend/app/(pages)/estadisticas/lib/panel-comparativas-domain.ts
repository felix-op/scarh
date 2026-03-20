import {
	type EstadisticaAtributo,
	type MedicionResponse,
} from "@servicios/api/django.api";

export type SharedTimeRange = "1h" | "6h" | "24h" | "7d" | "30d" | "90d";

export type ChartSerie = {
	limnigrafoId: number;
	dataKey: string;
	label: string;
	color: string;
};

export type ChartPoint = {
	date: string;
	[key: string]: string | number | null;
};

export const PANEL_CHART_COLORS = [
	"#0EA5E9",
	"#22C55E",
	"#F97316",
	"#A855F7",
	"#E11D48",
	"#14B8A6",
	"#6366F1",
	"#F59E0B",
];

export const CHART_PAGE_SIZE = 2000;
export const MAX_CHART_POINTS = 140;

export const WINDOW_DURATION_MS: Record<SharedTimeRange, number> = {
	"1h": 60 * 60 * 1000,
	"6h": 6 * 60 * 60 * 1000,
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
	"90d": 90 * 24 * 60 * 60 * 1000,
};

export const TIME_RANGE_LABEL: Record<SharedTimeRange, string> = {
	"1h": "Última hora",
	"6h": "Últimas 6 horas",
	"24h": "Últimas 24 horas",
	"90d": "Últimos 90 días",
	"30d": "Últimos 30 días",
	"7d": "Últimos 7 días",
};

export const ATRIBUTO_METADATA: Record<EstadisticaAtributo, { label: string; unit: string; decimals: number }> = {
	altura_agua: {
		label: "Altura del agua",
		unit: "m",
		decimals: 2,
	},
	presion: {
		label: "Presión",
		unit: "hPa",
		decimals: 2,
	},
	temperatura: {
		label: "Temperatura",
		unit: "°C",
		decimals: 2,
	},
};

export function getMedicionValueByAtributo(
	medicion: MedicionResponse,
	atributo: EstadisticaAtributo,
): number | null {
	if (atributo === "altura_agua") {
		return medicion.altura_agua;
	}
	if (atributo === "presion") {
		return medicion.presion;
	}
	return medicion.temperatura;
}

export function formatAtributoValue(value: number | null, atributo: EstadisticaAtributo): string {
	if (value === null || Number.isNaN(value)) {
		return "-";
	}

	const { decimals, unit } = ATRIBUTO_METADATA[atributo];
	return `${value.toFixed(decimals)} ${unit}`;
}

export function toNumericTooltipValue(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

export function getStartDateFromRange(reference: Date, range: SharedTimeRange): Date {
	return new Date(reference.getTime() - WINDOW_DURATION_MS[range]);
}
