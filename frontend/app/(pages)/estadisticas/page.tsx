"use client";

import { useEffect, useMemo, useState } from "react";
import PaginaBase from "@componentes/base/PaginaBase";
import EstadisticaCard from "@componentes/EstadisticaCard";
import MultiSelect, { type MultiSelectOption } from "@componentes/components/ui/multi-select";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@componentes/components/ui/tabs";
import {
	type MedicionPaginatedResponse,
	type MedicionResponse,
} from "@servicios/api/django.api";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { LimnigrafoResponse } from "types/limnigrafos";
import {
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import { toDatetimeLocalInputValue } from "../mediciones/utils";
import PanelComparativas from "./componentes/PanelComparativas";
import TablaComparativaEstadisticas from "./componentes/TablaComparativaEstadisticas";

const FETCH_PAGE_SIZE = 1000;
const MAX_FETCH_ROWS = 20000;
const REALTIME_REFRESH_MS = 30000;
const MIN_RATE_INTERVAL_MS = 60 * 1000;
// Umbral de  z-score (cuantas desviaciones con desviación absoluta mediana) para descartar picos de tasa irrealmente altos o bajos.
const RATE_MAD_Z_THRESHOLD = 6;

type EstadisticaAtributo = "altura_agua" | "presion" | "temperatura";
type ModoFiltro = "realtime" | "rango";
type VentanaRealtime = "1h" | "6h" | "24h" | "7d" | "30d" | "90d";
type EstadisticasTab = "graficos" | "tabla";

type EstadisticasFilters = {
	atributo: EstadisticaAtributo;
	modo: ModoFiltro;
	ventana: VentanaRealtime;
	desde: string;
	hasta: string;
	limnigrafos: string[];
};

type TablaComparativaFilters = {
	atributo: EstadisticaAtributo;
	desde: string;
	hasta: string;
	limnigrafos: string[];
};

type ActiveRange = {
	currentFrom: number;
	currentTo: number;
	previousFrom: number;
	previousTo: number;
};

type ParsedMedicion = MedicionResponse & {
	timestamp: number;
};

type Summary = {
	registros: number;
	promedio: number | null;
	minimo: number | null;
	maximo: number | null;
	desvio: number | null;
	p90: number | null;
};

const ATRIBUTO_METADATA: Record<EstadisticaAtributo, { label: string; unit: string; decimals: number }> = {
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

const REALTIME_WINDOW_LABELS: Record<VentanaRealtime, string> = {
	"1h": "Última hora",
	"6h": "Últimas 6 horas",
	"24h": "Últimas 24 horas",
	"7d": "Últimos 7 días",
	"30d": "Últimos 30 días",
	"90d": "Últimos 90 días",
};

const CHART_COLORS = {
	tasa: "#F97316",
	automatico: "#22C55E",
	manual: "#F97316",
};

const rateChartConfig: ChartConfig = {
	rate: { label: "Tasa de cambio", color: CHART_COLORS.tasa },
};

const fuenteChartConfig: ChartConfig = {
	automatico: { label: "Automático", color: CHART_COLORS.automatico },
	manual: { label: "Manual", color: CHART_COLORS.manual },
};

function getDefaultDateRange() {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
	};
}

function getDefaultFilters(): EstadisticasFilters {
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

function getDefaultTablaComparativaFilters(): TablaComparativaFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		atributo: "altura_agua",
		desde,
		hasta,
		limnigrafos: [],
	};
}

function toIsoString(value: string): string | null {
	if (!value) {
		return null;
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return parsed.toISOString();
}

function getWindowDurationMs(window: VentanaRealtime): number {
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

function resolveCurrentRange(filters: EstadisticasFilters, reference: Date): { from: Date; to: Date } {
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

function getMedicionValueByAtributo(medicion: MedicionResponse, atributo: EstadisticaAtributo): number | null {
	if (atributo === "altura_agua") {
		return medicion.altura_agua;
	}
	if (atributo === "presion") {
		return medicion.presion;
	}
	return medicion.temperatura;
}

function formatMetricValue(value: number | null, atributo: EstadisticaAtributo): string {
	if (value === null || Number.isNaN(value)) {
		return "-";
	}

	const { decimals, unit } = ATRIBUTO_METADATA[atributo];
	return `${value.toFixed(decimals)} ${unit}`;
}

function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}

	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function computePercentile(values: number[], percentile: number): number | null {
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

function computeSummary(values: number[]): Summary {
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

function getRateBucketSizeMs(durationMs: number): number {
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

function formatDateTick(value: string, durationMs: number): string {
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

function formatDateTime(value: number | string): string {
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

function formatVariation(value: number | null): string {
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

async function fetchAllMedicionesForStats(queryParams: Record<string, string>): Promise<MedicionResponse[]> {
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

export default function EstadisticasPage() {
	const [activeTab, setActiveTab] = useState<EstadisticasTab>("graficos");
	const [filters, setFilters] = useState<EstadisticasFilters>(getDefaultFilters);
	const [appliedFilters, setAppliedFilters] = useState<EstadisticasFilters>(getDefaultFilters);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [filterError, setFilterError] = useState<string | null>(null);
	const [tablaFilters, setTablaFilters] = useState<TablaComparativaFilters>(getDefaultTablaComparativaFilters);
	const [tablaAppliedFilters, setTablaAppliedFilters] = useState<TablaComparativaFilters>(getDefaultTablaComparativaFilters);
	const [tablaFilterError, setTablaFilterError] = useState<string | null>(null);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [refreshTick, setRefreshTick] = useState(0);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
	const [rawMediciones, setRawMediciones] = useState<MedicionResponse[]>([]);
	const [activeRange, setActiveRange] = useState<ActiveRange | null>(null);

	const { data: limnigrafosData, error: limnigrafosError } = useGetLimnigrafos({
		params: {
			queryParams: {
				limit: "1000",
				page: "1",
			},
		},
		config: {
			refetchInterval: 300000,
		},
	});

	useEffect(() => {
		if (appliedFilters.modo !== "realtime") {
			return;
		}

		const intervalId = window.setInterval(() => {
			setRefreshTick((previous) => previous + 1);
		}, REALTIME_REFRESH_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [appliedFilters.modo, appliedFilters.ventana]);

	useEffect(() => {
		let cancelled = false;

		async function loadMediciones() {
			setIsLoadingData(true);
			setFetchError(null);

			const now = new Date();
			const initialCurrentRange = resolveCurrentRange(appliedFilters, now);
			const initialDurationMs = Math.max(60 * 1000, initialCurrentRange.to.getTime() - initialCurrentRange.from.getTime());
			const effectiveCurrentRange = initialCurrentRange;
			const effectivePreviousRange = {
				from: new Date(initialCurrentRange.from.getTime() - initialDurationMs),
				to: new Date(initialCurrentRange.from),
			};

			try {
				let rows: MedicionResponse[] = [];

				if (appliedFilters.modo === "realtime") {
					rows = await fetchAllMedicionesForStats({
						fecha_desde: effectivePreviousRange.from.toISOString(),
						fecha_hasta: now.toISOString(),
					});
				} else {
					rows = await fetchAllMedicionesForStats({
						fecha_desde: effectivePreviousRange.from.toISOString(),
						fecha_hasta: effectiveCurrentRange.to.toISOString(),
					});
				}

				const boundedRows = rows.filter((item) => {
					const timestamp = new Date(item.fecha_hora).getTime();
					if (Number.isNaN(timestamp)) {
						return false;
					}

					return timestamp >= effectivePreviousRange.from.getTime()
						&& timestamp <= effectiveCurrentRange.to.getTime();
				});

				if (cancelled) {
					return;
				}

				setRawMediciones(boundedRows);
				setActiveRange({
					currentFrom: effectiveCurrentRange.from.getTime(),
					currentTo: effectiveCurrentRange.to.getTime(),
					previousFrom: effectivePreviousRange.from.getTime(),
					previousTo: effectivePreviousRange.to.getTime(),
				});
				setLastUpdatedAt(new Date().toISOString());
			} catch (error) {
				if (cancelled) {
					return;
				}
				setRawMediciones([]);
				setActiveRange({
					currentFrom: effectiveCurrentRange.from.getTime(),
					currentTo: effectiveCurrentRange.to.getTime(),
					previousFrom: effectivePreviousRange.from.getTime(),
					previousTo: effectivePreviousRange.to.getTime(),
				});
				setFetchError(error instanceof Error ? error.message : "No se pudieron cargar las mediciones para estadísticas.");
			} finally {
				if (!cancelled) {
					setIsLoadingData(false);
				}
			}
		}

		loadMediciones();

		return () => {
			cancelled = true;
		};
	}, [appliedFilters, refreshTick]);

	const limnigrafosPayload = limnigrafosData as Paginado<LimnigrafoResponse> | LimnigrafoResponse[] | undefined;
	const limnigrafos = useMemo(
		() => (
			Array.isArray(limnigrafosPayload)
				? limnigrafosPayload
				: limnigrafosPayload?.results ?? []
		),
		[limnigrafosPayload],
	);

	const limnigrafoOptions = useMemo<MultiSelectOption[]>(
		() =>
			limnigrafos.map((limnigrafo) => ({
				value: String(limnigrafo.id),
				label: limnigrafo.codigo,
			})),
		[limnigrafos],
	);

	const selectedLimnigrafoIds = useMemo(
		() => appliedFilters.limnigrafos
			.map((value) => Number.parseInt(value, 10))
			.filter((value) => !Number.isNaN(value)),
		[appliedFilters.limnigrafos],
	);

	const selectedLimnigrafoIdSet = useMemo(
		() => new Set(selectedLimnigrafoIds),
		[selectedLimnigrafoIds],
	);

	const parsedMediciones = useMemo<ParsedMedicion[]>(() => {
		return rawMediciones
			.map((medicion) => {
				const timestamp = new Date(medicion.fecha_hora).getTime();
				if (Number.isNaN(timestamp)) {
					return null;
				}
				return {
					...medicion,
					timestamp,
				};
			})
			.filter((item): item is ParsedMedicion => item !== null)
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [rawMediciones]);

	const currentRows = useMemo(() => {
		if (!activeRange) {
			return [] as ParsedMedicion[];
		}

		return parsedMediciones.filter((medicion) => {
			const inCurrentRange = medicion.timestamp >= activeRange.currentFrom && medicion.timestamp <= activeRange.currentTo;
			const inSelectedLimnigrafo = selectedLimnigrafoIdSet.size === 0 || selectedLimnigrafoIdSet.has(medicion.limnigrafo);
			return inCurrentRange && inSelectedLimnigrafo;
		});
	}, [activeRange, parsedMediciones, selectedLimnigrafoIdSet]);

	const previousRows = useMemo(() => {
		if (!activeRange) {
			return [] as ParsedMedicion[];
		}

		return parsedMediciones.filter((medicion) => {
			const inPreviousRange = medicion.timestamp >= activeRange.previousFrom && medicion.timestamp < activeRange.previousTo;
			const inSelectedLimnigrafo = selectedLimnigrafoIdSet.size === 0 || selectedLimnigrafoIdSet.has(medicion.limnigrafo);
			return inPreviousRange && inSelectedLimnigrafo;
		});
	}, [activeRange, parsedMediciones, selectedLimnigrafoIdSet]);

	const atributoMeta = ATRIBUTO_METADATA[appliedFilters.atributo];

	const currentValues = useMemo(
		() => currentRows
			.map((medicion) => getMedicionValueByAtributo(medicion, appliedFilters.atributo))
			.filter((value): value is number => value !== null && Number.isFinite(value)),
		[currentRows, appliedFilters.atributo],
	);

	const previousValues = useMemo(
		() => previousRows
			.map((medicion) => getMedicionValueByAtributo(medicion, appliedFilters.atributo))
			.filter((value): value is number => value !== null && Number.isFinite(value)),
		[previousRows, appliedFilters.atributo],
	);

	const currentSummary = useMemo(() => computeSummary(currentValues), [currentValues]);
	const previousSummary = useMemo(() => computeSummary(previousValues), [previousValues]);

	const averageVariation = useMemo(() => {
		if (currentSummary.promedio === null || previousSummary.promedio === null || previousSummary.promedio === 0) {
			return null;
		}

		return ((currentSummary.promedio - previousSummary.promedio) / Math.abs(previousSummary.promedio)) * 100;
	}, [currentSummary.promedio, previousSummary.promedio]);

	const activeDurationMs = useMemo(() => {
		if (!activeRange) {
			return getWindowDurationMs("24h");
		}

		return Math.max(60 * 1000, activeRange.currentTo - activeRange.currentFrom);
	}, [activeRange]);

	const rateComputation = useMemo(() => {
		const grouped = new Map<number, ParsedMedicion[]>();
		currentRows.forEach((medicion) => {
			if (medicion.altura_agua === null || !Number.isFinite(medicion.altura_agua)) {
				return;
			}

			const existing = grouped.get(medicion.limnigrafo) ?? [];
			existing.push(medicion);
			grouped.set(medicion.limnigrafo, existing);
		});

		const candidateRates: Array<{ timestamp: number; rate: number }> = [];
		grouped.forEach((rows) => {
			const ordered = [...rows].sort((a, b) => a.timestamp - b.timestamp);
			for (let index = 1; index < ordered.length; index += 1) {
				const previous = ordered[index - 1];
				const current = ordered[index];
				if (previous.altura_agua === null || current.altura_agua === null) {
					continue;
				}

				const deltaMs = current.timestamp - previous.timestamp;
				if (deltaMs < MIN_RATE_INTERVAL_MS) {
					continue;
				}

				const deltaHours = deltaMs / (60 * 60 * 1000);
				if (deltaHours <= 0) {
					continue;
				}

				const rate = (current.altura_agua - previous.altura_agua) / deltaHours;
				candidateRates.push({
					timestamp: current.timestamp,
					rate,
				});
			}
		});

		const orderedCandidates = candidateRates.sort((a, b) => a.timestamp - b.timestamp);
		if (orderedCandidates.length === 0) {
			return {
				points: [] as Array<{ timestamp: number; rate: number }>,
				totalIntervals: 0,
			};
		}

		const rates = orderedCandidates.map((item) => item.rate);
		const median = computePercentile(rates, 50);
		const mad = median === null
			? null
			: computePercentile(rates.map((value) => Math.abs(value - median)), 50);

		const filtered = median === null || mad === null || mad <= Number.EPSILON
			? orderedCandidates
			: orderedCandidates.filter((item) => {
				const robustZ = (0.6745 * (item.rate - median)) / mad;
				return Number.isFinite(robustZ) && Math.abs(robustZ) <= RATE_MAD_Z_THRESHOLD;
			});

		return {
			points: filtered.map((item) => ({
				timestamp: item.timestamp,
				rate: Number(item.rate.toFixed(4)),
			})),
			totalIntervals: orderedCandidates.length,
		};
	}, [currentRows]);

	const rawRatePoints = rateComputation.points;
	const discardedRatePoints = Math.max(0, rateComputation.totalIntervals - rawRatePoints.length);

	const rateSeriesData = useMemo(() => {
		if (!activeRange || rawRatePoints.length === 0) {
			return [] as Array<{ date: string; rate: number }>;
		}

		// Keep raw intervals when the series is manageable so the curve preserves local behavior.
		if (rawRatePoints.length <= 180) {
			return rawRatePoints.map((item) => ({
				date: new Date(item.timestamp).toISOString(),
				rate: item.rate,
			}));
		}

		const durationMs = activeRange.currentTo - activeRange.currentFrom;
		const bucketSizeMs = getRateBucketSizeMs(durationMs);
		const bucketMap = new Map<number, { sum: number; count: number }>();

		rawRatePoints.forEach((item) => {
			const bucket = activeRange.currentFrom + (Math.floor((item.timestamp - activeRange.currentFrom) / bucketSizeMs) * bucketSizeMs);
			const existing = bucketMap.get(bucket) ?? { sum: 0, count: 0 };
			existing.sum += item.rate;
			existing.count += 1;
			bucketMap.set(bucket, existing);
		});

		return Array.from(bucketMap.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([bucket, aggregate]) => ({
				date: new Date(bucket).toISOString(),
				rate: Number((aggregate.sum / aggregate.count).toFixed(4)),
			}));
	}, [activeRange, rawRatePoints]);

	const rateSummary = useMemo(() => {
		if (rawRatePoints.length === 0) {
			return {
				promedio: null as number | null,
				maxSubida: null as number | null,
				maxBajada: null as number | null,
			};
		}

		const values = rawRatePoints.map((item) => item.rate);
		const promedio = values.reduce((acc, current) => acc + current, 0) / values.length;

		return {
			promedio,
			maxSubida: Math.max(...values),
			maxBajada: Math.min(...values),
		};
	}, [rawRatePoints]);

	const fuenteStats = useMemo(() => {
		let automatico = 0;
		let manual = 0;

		currentRows.forEach((medicion) => {
			if (medicion.fuente === "manual") {
				manual += 1;
			} else {
				automatico += 1;
			}
		});

		const total = automatico + manual;
		const automaticoPct = total > 0 ? (automatico / total) * 100 : 0;
		const manualPct = total > 0 ? (manual / total) * 100 : 0;

		return {
			automatico,
			manual,
			total,
			automaticoPct,
			manualPct,
		};
	}, [currentRows]);

	const fuenteChartData = useMemo(
		() => [
			{ key: "automatico", label: "Automático", value: fuenteStats.automatico, fill: CHART_COLORS.automatico },
			{ key: "manual", label: "Manual", value: fuenteStats.manual, fill: CHART_COLORS.manual },
		],
		[fuenteStats.automatico, fuenteStats.manual],
	);

	const activeRangeLabel = useMemo(() => {
		if (!activeRange) {
			return "-";
		}

		return `${formatDateTime(activeRange.currentFrom)} - ${formatDateTime(activeRange.currentTo)}`;
	}, [activeRange]);

	const referenciaEstadisticasLabel = useMemo(() => {
		if (appliedFilters.modo !== "realtime") {
			return `Rango aplicado: ${activeRangeLabel}.`;
		}

		if (parsedMediciones.length === 0) {
			return `Referencia temporal: sin mediciones disponibles, se usa hora actual. Rango actual: ${activeRangeLabel}.`;
		}

		const ultimaMedicion = parsedMediciones[parsedMediciones.length - 1];
		return `Referencia temporal (última medición): ${formatDateTime(ultimaMedicion.timestamp)}. Rango actual: ${activeRangeLabel}.`;
	}, [activeRangeLabel, appliedFilters.modo, parsedMediciones]);

	const noDataInRange = !isLoadingData && currentRows.length === 0;
	const shouldShowRateChart = appliedFilters.atributo === "altura_agua";

	function handleApplyFilters() {
		setFilterError(null);

		if (filters.modo === "rango") {
			const desdeIso = toIsoString(filters.desde);
			const hastaIso = toIsoString(filters.hasta);

			if (!desdeIso || !hastaIso) {
				setFilterError("Completá un rango de fechas válido para aplicar filtros.");
				return;
			}

			if (new Date(desdeIso).getTime() >= new Date(hastaIso).getTime()) {
				setFilterError("La fecha desde debe ser anterior a la fecha hasta.");
				return;
			}
		}

		setAppliedFilters(filters);
	}

	function handleResetFilters() {
		const reset = getDefaultFilters();
		setFilters(reset);
		setAppliedFilters(reset);
		setFilterError(null);
	}

	function handleApplyTablaFilters() {
		setTablaFilterError(null);
		const desdeIso = toIsoString(tablaFilters.desde);
		const hastaIso = toIsoString(tablaFilters.hasta);

		if (!desdeIso || !hastaIso) {
			setTablaFilterError("Completá un rango de fechas válido para aplicar filtros.");
			return;
		}

		if (new Date(desdeIso).getTime() >= new Date(hastaIso).getTime()) {
			setTablaFilterError("La fecha desde debe ser anterior a la fecha hasta.");
			return;
		}

		setTablaAppliedFilters(tablaFilters);
	}

	function handleResetTablaFilters() {
		const reset = getDefaultTablaComparativaFilters();
		setTablaFilters(reset);
		setTablaAppliedFilters(reset);
		setTablaFilterError(null);
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">Estadísticas</h1>
						<p className="text-base text-[#4D5562] dark:text-[#94A3B8]">
							Panel analítico en tiempo real y por rango de fechas con base en mediciones históricas de limnígrafos.
						</p>
					</header>

					<Tabs
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as EstadisticasTab)}
						className="gap-8"
					>
						<section className="rounded-[24px] bg-white p-3 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
							<TabsList className="rounded-2xl bg-[#E2E8F0] p-1 dark:bg-[#0F172A]">
								<TabsTrigger
									value="graficos"
									className="rounded-xl px-4 py-2 text-[14px] font-semibold text-[#475569] hover:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-[0px_4px_10px_rgba(15,23,42,0.12)] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] dark:data-[state=active]:bg-[#1E293B] dark:data-[state=active]:text-[#E2E8F0]"
								>
									Gráficos
								</TabsTrigger>
								<TabsTrigger
									value="tabla"
									className="rounded-xl px-4 py-2 text-[14px] font-semibold text-[#475569] hover:text-[#1E293B] data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-[0px_4px_10px_rgba(15,23,42,0.12)] dark:text-[#94A3B8] dark:hover:text-[#E2E8F0] dark:data-[state=active]:bg-[#1E293B] dark:data-[state=active]:text-[#E2E8F0]"
								>
									Tabla comparativa
								</TabsTrigger>
							</TabsList>
						</section>

						<TabsContent value="graficos" className="mt-0 flex flex-col gap-8">
							<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Variable
										<select
											value={filters.atributo}
											onChange={(event) => setFilters((previous) => ({
												...previous,
												atributo: event.target.value as EstadisticaAtributo,
											}))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										>
											<option value="altura_agua">Nivel del agua</option>
											<option value="presion">Presión atmosférica</option>
											<option value="temperatura">Temperatura</option>
										</select>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Modo de análisis
										<select
											value={filters.modo}
											onChange={(event) => setFilters((previous) => ({
												...previous,
												modo: event.target.value as ModoFiltro,
											}))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										>
											<option value="realtime">Tiempo real</option>
											<option value="rango">Rango personalizado</option>
										</select>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Ventana en tiempo real
										<select
											value={filters.ventana}
											disabled={filters.modo !== "realtime"}
											onChange={(event) => setFilters((previous) => ({
												...previous,
												ventana: event.target.value as VentanaRealtime,
											}))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										>
											<option value="1h">Última hora</option>
											<option value="6h">Últimas 6 horas</option>
											<option value="24h">Últimas 24 horas</option>
											<option value="7d">Últimos 7 días</option>
											<option value="30d">Últimos 30 días</option>
											<option value="90d">Últimos 90 días</option>
										</select>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Fecha desde
										<input
											type="datetime-local"
											value={filters.desde}
											disabled={filters.modo !== "rango"}
											onChange={(event) => setFilters((previous) => ({ ...previous, desde: event.target.value }))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										/>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Fecha hasta
										<input
											type="datetime-local"
											value={filters.hasta}
											disabled={filters.modo !== "rango"}
											onChange={(event) => setFilters((previous) => ({ ...previous, hasta: event.target.value }))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										/>
									</label>

									<div className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1] xl:col-span-1">
										<label htmlFor="estadisticas-limnigrafos-trigger">
											Limnígrafos ({filters.limnigrafos.length})
										</label>
										<MultiSelect
											id="estadisticas-limnigrafos-trigger"
											options={limnigrafoOptions}
											selectedValues={filters.limnigrafos}
											onChange={(values) => setFilters((previous) => ({ ...previous, limnigrafos: values }))}
											placeholder="Seleccionar limnígrafos"
											className="h-11 text-[13px]"
											emptyText="No hay limnígrafos disponibles"
										/>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
									<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
										{appliedFilters.modo === "realtime"
											? `Modo activo: ${REALTIME_WINDOW_LABELS[appliedFilters.ventana]} (refresco cada 30 segundos).`
											: "Modo activo: rango personalizado."}
										<br />
										Período actual: {activeRangeLabel}
									</p>

									<div className="flex flex-wrap items-center gap-3">
										<button
											type="button"
											onClick={handleApplyFilters}
											className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)] hover:bg-[#0873B2]"
										>
											Aplicar filtros
										</button>
										<button
											type="button"
											onClick={handleResetFilters}
											className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155] shadow-[0px_4px_10px_rgba(15,23,42,0.08)] hover:bg-[#F8FAFC]"
										>
											Restablecer
										</button>
									</div>
								</div>
							</section>

							{filterError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									{filterError}
								</p>
							) : null}
							{fetchError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									{fetchError}
								</p>
							) : null}
							{limnigrafosError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									No se pudieron cargar los limnígrafos para filtros.
								</p>
							) : null}

							<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
											Estadísticas descriptivas
										</p>
										<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
											Variable analizada: {atributoMeta.label}. Registros actuales: {currentSummary.registros}.
										</p>
										<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
											{referenciaEstadisticasLabel}
										</p>
									</div>
									<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
										Última actualización: {lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "-"}
									</p>
								</div>

								<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
									<EstadisticaCard
										title="Promedio"
										value={formatMetricValue(currentSummary.promedio, appliedFilters.atributo)}
										detail={formatVariation(averageVariation)}
										accent="#0EA5E9"
									/>
									<EstadisticaCard
										title="Mínimo"
										value={formatMetricValue(currentSummary.minimo, appliedFilters.atributo)}
										detail="Valor mínimo observado en el período actual"
										accent="#22C55E"
									/>
									<EstadisticaCard
										title="Máximo"
										value={formatMetricValue(currentSummary.maximo, appliedFilters.atributo)}
										detail="Valor máximo observado en el período actual"
										accent="#F97316"
									/>
									<EstadisticaCard
										title="Desvío estándar"
										value={formatMetricValue(currentSummary.desvio, appliedFilters.atributo)}
										detail="Nivel de variabilidad de la serie"
										accent="#6366F1"
									/>
									<EstadisticaCard
										title="Percentil 90"
										value={formatMetricValue(currentSummary.p90, appliedFilters.atributo)}
										detail="90% de los datos están por debajo de este valor"
										accent="#14B8A6"
									/>
									<EstadisticaCard
										title="Registros analizados"
										value={String(currentSummary.registros)}
										detail="Muestras válidas de la variable en el período actual"
										accent="#A855F7"
									/>
								</div>
							</section>

							<PanelComparativas
								limnigrafos={limnigrafos}
								limnigrafosError={limnigrafosError}
								chartAtributo={appliedFilters.atributo}
								chartLimnigrafos={appliedFilters.limnigrafos}
								chartTimeRange={appliedFilters.ventana}
							/>

							{shouldShowRateChart ? (
								<section className="grid gap-6 lg:grid-cols-1">
									<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
										<div className="mb-4">
											<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
												Tasa de cambio del nivel del agua
											</p>
											<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
												Cálculo de subida/bajada (m/h) entre mediciones consecutivas.
											</p>
										</div>

										{rateSeriesData.length === 0 ? (
											<div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
												No hay datos suficientes de nivel para calcular tasas.
											</div>
										) : (
											<ChartContainer config={rateChartConfig} className="h-[280px] w-full">
												<LineChart data={rateSeriesData}>
													<CartesianGrid vertical={false} />
													<XAxis
														dataKey="date"
														tickLine={false}
														axisLine={false}
														tickMargin={8}
														minTickGap={32}
														tickFormatter={(value) => formatDateTick(String(value), activeDurationMs)}
													/>
													<YAxis tickLine={false} axisLine={false} width={58} />
													<ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="4 4" />
													<ChartTooltip
														cursor={false}
														content={(
															<ChartTooltipContent
																indicator="dot"
																labelFormatter={(value) => formatDateTime(String(value))}
																formatter={(value) => {
																	const numeric = typeof value === "number" ? value : Number(value);
																	return (
																		<div className="flex w-full items-center justify-between gap-3">
																			<span className="text-muted-foreground">Tasa</span>
																			<span className="font-mono font-medium text-foreground tabular-nums">
																				{formatNumber(numeric, 4)} m/h
																			</span>
																		</div>
																	);
																}}
															/>
														)}
													/>
													<Line
														dataKey="rate"
														name="Tasa de cambio"
														type="monotone"
														stroke="var(--color-rate)"
														strokeWidth={2.5}
														dot={false}
														isAnimationActive={false}
													/>
												</LineChart>
											</ChartContainer>
										)}

										<div className="mt-4 grid gap-2 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
											<p>
												Intervalos usados para calcular la tasa: <span className="font-semibold">{rawRatePoints.length}</span>
											</p>
											<p>
												Intervalos excluidos por control de calidad: <span className="font-semibold">{discardedRatePoints}</span>
											</p>
											<p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
												Criterio de calidad: se omiten intervalos menores a {MIN_RATE_INTERVAL_MS / (60 * 1000)} min y valores extremos detectados con mediana + MAD (umbral robusto |z| &gt; {RATE_MAD_Z_THRESHOLD}) para evitar tasas irrealmente altas/bajas por saltos atípicos y proteger el promedio y los extremos mostrados.
											</p>
											<p>
												Puntos graficados: <span className="font-semibold">{rateSeriesData.length}</span>
											</p>
											<p>
												Tasa promedio: <span className="font-semibold">{rateSummary.promedio === null ? "-" : `${formatNumber(rateSummary.promedio, 4)} m/h`}</span>
											</p>
											<p>
												Subida máxima: <span className="font-semibold">{rateSummary.maxSubida === null ? "-" : `${formatNumber(rateSummary.maxSubida, 4)} m/h`}</span>
											</p>
											<p>
												Bajada máxima: <span className="font-semibold">{rateSummary.maxBajada === null ? "-" : `${formatNumber(rateSummary.maxBajada, 4)} m/h`}</span>
											</p>
										</div>
									</div>
								</section>
							) : null}

							<section className="grid gap-6 lg:grid-cols-1">
								<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
									<div className="mb-4">
										<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
											Calidad operativa de carga
										</p>
										<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
											Distribución de registros automáticos y manuales en el período actual.
										</p>
									</div>

									{fuenteStats.total === 0 ? (
										<div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
											No hay registros para analizar la fuente de carga.
										</div>
									) : (
										<ChartContainer config={fuenteChartConfig} className="h-[280px] w-full">
											<PieChart>
												<Pie
													data={fuenteChartData}
													dataKey="value"
													nameKey="label"
													innerRadius={56}
													outerRadius={90}
													paddingAngle={2}
												>
													{fuenteChartData.map((entry) => (
														<Cell key={entry.key} fill={entry.fill} />
													))}
												</Pie>
												<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
												<ChartLegend content={<ChartLegendContent />} />
											</PieChart>
										</ChartContainer>
									)}

									<div className="mt-4 grid gap-2 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
										<p>
											Automático: <span className="font-semibold">{fuenteStats.automatico}</span> ({fuenteStats.automaticoPct.toFixed(2)} %)
										</p>
										<p>
											Manual: <span className="font-semibold">{fuenteStats.manual}</span> ({fuenteStats.manualPct.toFixed(2)} %)
										</p>
										<p>
											Total de eventos: <span className="font-semibold">{fuenteStats.total}</span>
										</p>
									</div>
								</div>
							</section>

							{noDataInRange ? (
								<p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#475569] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]">
									No se encontraron mediciones en el período y filtros seleccionados.
								</p>
							) : null}
						</TabsContent>

						<TabsContent value="tabla" className="mt-0 flex flex-col gap-8">
							<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
								<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Variable
										<select
											value={tablaFilters.atributo}
											onChange={(event) => setTablaFilters((previous) => ({
												...previous,
												atributo: event.target.value as EstadisticaAtributo,
											}))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										>
											<option value="altura_agua">Nivel del agua</option>
											<option value="presion">Presión atmosférica</option>
											<option value="temperatura">Temperatura</option>
										</select>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Fecha desde
										<input
											type="datetime-local"
											value={tablaFilters.desde}
											onChange={(event) => setTablaFilters((previous) => ({ ...previous, desde: event.target.value }))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										/>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Fecha hasta
										<input
											type="datetime-local"
											value={tablaFilters.hasta}
											onChange={(event) => setTablaFilters((previous) => ({ ...previous, hasta: event.target.value }))}
											className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
										/>
									</label>

									<div className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										<label htmlFor="estadisticas-tabla-limnigrafos-trigger">
											Limnígrafos ({tablaFilters.limnigrafos.length})
										</label>
										<MultiSelect
											id="estadisticas-tabla-limnigrafos-trigger"
											options={limnigrafoOptions}
											selectedValues={tablaFilters.limnigrafos}
											onChange={(values) => setTablaFilters((previous) => ({ ...previous, limnigrafos: values }))}
											placeholder="Seleccionar limnígrafos"
											className="h-11 text-[13px]"
											emptyText="No hay limnígrafos disponibles"
										/>
									</div>
								</div>

								<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
									<div className="flex flex-wrap items-center gap-3">
										<button
											type="button"
											onClick={handleApplyTablaFilters}
											className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)] hover:bg-[#0873B2]"
										>
											Aplicar filtros
										</button>
										<button
											type="button"
											onClick={handleResetTablaFilters}
											className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155] shadow-[0px_4px_10px_rgba(15,23,42,0.08)] hover:bg-[#F8FAFC]"
										>
											Restablecer
										</button>
									</div>
								</div>
							</section>

							{tablaFilterError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									{tablaFilterError}
								</p>
							) : null}
							{limnigrafosError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									No se pudieron cargar los limnígrafos para filtros.
								</p>
							) : null}

							<TablaComparativaEstadisticas
								atributo={tablaAppliedFilters.atributo}
								desde={tablaAppliedFilters.desde}
								hasta={tablaAppliedFilters.hasta}
								limnigrafosSeleccionados={tablaAppliedFilters.limnigrafos}
								limnigrafos={limnigrafos}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</PaginaBase>
	);
}
