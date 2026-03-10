"use client";

import TablaHome from "@componentes/TablaHome";
import MetricaCard from "@componentes/MetricaCard";
import PaginaBase from "@componentes/base/PaginaBase";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@componentes/components/ui/card";
import MultiSelect, { MultiSelectOption } from "@componentes/components/ui/multi-select";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import {
	EstadisticaOutputItem,
	useGetLimnigrafos,
	useGetMediciones,
	usePostEstadistica,
	type EstadisticaAtributo,
	type LimnigrafoResponse,
	type LimnigrafoPaginatedResponse,
	type MedicionResponse,
	type MedicionPaginatedResponse,
} from "@servicios/api/django.api";
import { transformarLimnigrafos } from "@lib/transformers/limnigrafoTransformer";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import SeccionComparativasMediciones from "../mediciones/secciones/SeccionComparativasMediciones";
import { ComparativasFilters } from "../mediciones/secciones/types";
import { toDatetimeLocalInputValue } from "../mediciones/utils";

// Prioridad de estados para ordenamiento (menor = más urgente)
const estadoPriority: Record<string, number> = {
	fuera: 0,
	advertencia: 1,
	prueba: 2,
	activo: 3,
};

const CHART_COLORS = [
	"#0EA5E9",
	"#22C55E",
	"#F97316",
	"#A855F7",
	"#E11D48",
	"#14B8A6",
	"#6366F1",
	"#F59E0B",
];

const CHART_PAGE_SIZE = 2000;
const HOME_PAGE_SIZE = 1000;
const MAX_CHART_POINTS = 140;

type ChartSerie = {
	limnigrafoId: number;
	dataKey: string;
	label: string;
	color: string;
};

type ChartPoint = {
	date: string;
	[key: string]: string | number | null;
};

type TimeRange = "90d" | "30d" | "7d";

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
	"90d": 90,
	"30d": 30,
	"7d": 7,
};

const TIME_RANGE_LABEL: Record<TimeRange, string> = {
	"90d": "Últimos 90 días",
	"30d": "Últimos 30 días",
	"7d": "Últimos 7 días",
};

const ATRIBUTO_METADATA: Record<EstadisticaAtributo, { label: string; unit: string; decimals: number }> = {
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

function getDefaultDateRange() {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
	};
}

function getDefaultComparativasFilters(): ComparativasFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		desde,
		hasta,
		atributo: "altura_agua",
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

function getMedicionValueByAtributo(
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

function formatAtributoValue(value: number | null, atributo: EstadisticaAtributo): string {
	if (value === null || Number.isNaN(value)) {
		return "-";
	}
	const { decimals, unit } = ATRIBUTO_METADATA[atributo];
	return `${value.toFixed(decimals)} ${unit}`;
}

function getStartDateFromRange(reference: Date, range: TimeRange): Date {
	const start = new Date(reference);
	start.setDate(start.getDate() - TIME_RANGE_DAYS[range]);
	return start;
}

export default function Home() {
	const [comparativasFilters, setComparativasFilters] = useState<ComparativasFilters>(getDefaultComparativasFilters);
	const [appliedComparativasFilters, setAppliedComparativasFilters] = useState<ComparativasFilters>(getDefaultComparativasFilters);
	const [compareIds, setCompareIds] = useState<string[]>([]);
	const [compareSearch, setCompareSearch] = useState("");
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");
	const [estadisticas, setEstadisticas] = useState<EstadisticaOutputItem[]>([]);
	const [estadisticasError, setEstadisticasError] = useState<string | null>(null);

	const { data: limnigrafosData, isLoading: loadingLimnigrafos, error: limnigrafosError } = useGetLimnigrafos({
		params: {
			queryParams: {
				limit: String(HOME_PAGE_SIZE),
				page: "1",
			},
		},
		config: {
			refetchInterval: 300000,
		}
	});

	const { data: medicionesRecientesData, isLoading: loadingMediciones, error: medicionesRecientesError } = useGetMediciones({
		params: {
			queryParams: {
				limit: String(HOME_PAGE_SIZE),
				page: "1",
			},
		},
		config: {
			refetchInterval: 300000,
		}
	});

	const comparativasQueryParams = useMemo(() => {
		const now = new Date();
		const from = new Date(now);
		from.setDate(now.getDate() - TIME_RANGE_DAYS["90d"]);

		const params: {
			limit: string;
			page: string;
			desde?: string;
			hasta?: string;
		} = {
			limit: String(CHART_PAGE_SIZE),
			page: "1",
			desde: from.toISOString(),
		};

		return params;
	}, []);

	const {
		data: medicionesComparativasData,
		isLoading: loadingComparativas,
		error: medicionesComparativasError,
	} = useGetMediciones({
		params: {
			queryParams: comparativasQueryParams,
		},
		config: {
			placeholderData: (previous) => previous,
			refetchInterval: 30000,
		}
	});

	const postEstadistica = usePostEstadistica();

	const limnigrafosPayload = limnigrafosData as LimnigrafoPaginatedResponse | LimnigrafoResponse[] | undefined;
	const limnigrafos = useMemo(
		() => (
			Array.isArray(limnigrafosPayload)
				? limnigrafosPayload
				: limnigrafosPayload?.results ?? []
		),
		[limnigrafosPayload],
	);

	const medicionesRecientes = useMemo(
		() => ((medicionesRecientesData as MedicionPaginatedResponse | undefined)?.results ?? []),
		[medicionesRecientesData],
	);
	const medicionesComparativas = useMemo(
		() => ((medicionesComparativasData as MedicionPaginatedResponse | undefined)?.results ?? []),
		[medicionesComparativasData],
	);

	const limnigrafoNameById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);

	const chartLimnigrafoOptions = useMemo<MultiSelectOption[]>(
		() =>
			limnigrafos.map((limnigrafo) => ({
				value: String(limnigrafo.id),
				label: limnigrafo.codigo,
			})),
		[limnigrafos],
	);

	const filteredCompareLimnigrafos = useMemo(() => {
		const search = compareSearch.trim().toLowerCase();
		if (!search) {
			return limnigrafos;
		}

		return limnigrafos.filter((limnigrafo) => (
			`${limnigrafo.codigo} ${limnigrafo.descripcion ?? ""} ${limnigrafo.id}`
				.toLowerCase()
				.includes(search)
		));
	}, [compareSearch, limnigrafos]);

	const medicionesMap = useMemo(() => {
		const map = new Map<number, MedicionResponse>();

		medicionesRecientes.forEach((medicion) => {
			const current = map.get(medicion.limnigrafo);
			if (!current) {
				map.set(medicion.limnigrafo, medicion);
				return;
			}

			if (new Date(medicion.fecha_hora).getTime() > new Date(current.fecha_hora).getTime()) {
				map.set(medicion.limnigrafo, medicion);
			}
		});

		return map;
	}, [medicionesRecientes]);

	const homeLimnigrafos = useMemo(() => {
		if (limnigrafos.length === 0 || medicionesMap.size === 0) {
			return [];
		}

		const transformados = transformarLimnigrafos(
			limnigrafos,
			medicionesMap
		);

		return transformados
			.filter(
				(item) =>
					item.estado.variante === "advertencia" ||
					item.estado.variante === "fuera"
			)
			.sort((a, b) => {
				const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
				const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
				return priorityA - priorityB;
			});
	}, [limnigrafos, medicionesMap]);

	const chartSeries = useMemo<ChartSerie[]>(() => {
		return compareIds
			.map((id, index) => {
				const parsedId = Number.parseInt(id, 10);
				if (Number.isNaN(parsedId)) {
					return null;
				}
				return {
					limnigrafoId: parsedId,
					dataKey: `limnigrafo_${parsedId}`,
					label: limnigrafoNameById.get(parsedId) ?? `ID ${parsedId}`,
					color: CHART_COLORS[index % CHART_COLORS.length],
				};
			})
			.filter((item): item is ChartSerie => item !== null);
	}, [compareIds, limnigrafoNameById]);

	const chartConfig = useMemo<ChartConfig>(() => {
		const config: ChartConfig = {};
		chartSeries.forEach((serie) => {
			config[serie.dataKey] = {
				label: serie.label,
				color: serie.color,
			};
		});
		return config;
	}, [chartSeries]);

	const chartData = useMemo<ChartPoint[]>(() => {
		if (chartSeries.length === 0 || medicionesComparativas.length === 0) {
			return [];
		}

		const allowedIds = new Set(chartSeries.map((serie) => serie.limnigrafoId));
		const ordered = [...medicionesComparativas]
			.filter((medicion) => allowedIds.has(medicion.limnigrafo))
			.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
			.slice(-MAX_CHART_POINTS);

		const grouped = new Map<string, ChartPoint>();

		ordered.forEach((medicion) => {
			const value = getMedicionValueByAtributo(medicion, appliedComparativasFilters.atributo);
			if (value === null || Number.isNaN(value)) {
				return;
			}

			const existing = grouped.get(medicion.fecha_hora) ?? {
				date: medicion.fecha_hora,
			};

			existing[`limnigrafo_${medicion.limnigrafo}`] = Number(value.toFixed(2));
			grouped.set(medicion.fecha_hora, existing);
		});

		return Array.from(grouped.entries())
			.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
			.map((entry) => entry[1]);
	}, [appliedComparativasFilters.atributo, chartSeries, medicionesComparativas]);

	const filteredChartData = useMemo(() => {
		if (chartData.length === 0) {
			return [];
		}

		const referenceDate = new Date(chartData[chartData.length - 1].date);
		const startDate = getStartDateFromRange(referenceDate, timeRange);

		return chartData.filter((point) => {
			const date = new Date(point.date);
			return date >= startDate;
		});
	}, [chartData, timeRange]);

	const resumenMetricas = useMemo(() => {
		if (chartSeries.length === 0) {
			return {
				totalRegistros: 0,
				promedio: null,
				minimo: null,
				maximo: null,
				ultimaMedicion: undefined,
			};
		}

		const selectedIds = new Set(chartSeries.map((serie) => serie.limnigrafoId));
		const referenceDate = chartData.length > 0
			? new Date(chartData[chartData.length - 1].date)
			: new Date();
		const startDate = getStartDateFromRange(referenceDate, timeRange);

		const medicionesEnRango = medicionesComparativas
			.filter((medicion) => selectedIds.has(medicion.limnigrafo))
			.filter((medicion) => new Date(medicion.fecha_hora) >= startDate);

		const valores = medicionesEnRango
			.map((medicion) => getMedicionValueByAtributo(medicion, appliedComparativasFilters.atributo))
			.filter((value): value is number => value !== null && Number.isFinite(value));

		const totalRegistros = medicionesEnRango.length;
		const promedio = valores.length > 0
			? valores.reduce((acc, current) => acc + current, 0) / valores.length
			: null;
		const minimo = valores.length > 0 ? Math.min(...valores) : null;
		const maximo = valores.length > 0 ? Math.max(...valores) : null;

		const ultimaMedicion = [...medicionesEnRango]
			.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0];

		return {
			totalRegistros,
			promedio,
			minimo,
			maximo,
			ultimaMedicion,
		};
	}, [appliedComparativasFilters.atributo, chartData, chartSeries, medicionesComparativas, timeRange]);

	const topError = limnigrafosError ?? medicionesRecientesError;
	const atributoSeleccionado = ATRIBUTO_METADATA[appliedComparativasFilters.atributo];
	const hasChartError = Boolean(medicionesComparativasError);

	async function handleCalcularEstadisticas() {
		setEstadisticasError(null);

		const selectedIds = compareIds;

		if (selectedIds.length === 0) {
			setEstadisticas([]);
			setEstadisticasError("Seleccioná al menos un limnígrafo para calcular estadísticas.");
			return;
		}

		const desdeIso = toIsoString(appliedComparativasFilters.desde);
		const hastaIso = toIsoString(appliedComparativasFilters.hasta);

		if (!desdeIso || !hastaIso) {
			setEstadisticas([]);
			setEstadisticasError("Definí un rango de fechas válido para calcular estadísticas.");
			return;
		}

		try {
			const result = await postEstadistica.mutateAsync({
				data: {
					limnigrafos: selectedIds
						.map((item) => Number.parseInt(item, 10))
						.filter((item) => !Number.isNaN(item)),
					atributo: appliedComparativasFilters.atributo,
					fecha_inicio: desdeIso,
					fecha_fin: hastaIso,
				},
			});
			setEstadisticas(result);
		} catch (error) {
			setEstadisticas([]);
			setEstadisticasError(
				error instanceof Error
					? error.message
					: "No se pudieron calcular estadísticas para el rango seleccionado.",
			);
		}
	}

	function handleComparativasFilterChange<K extends keyof ComparativasFilters>(
		field: K,
		value: ComparativasFilters[K],
	) {
		setComparativasFilters((prev) => ({ ...prev, [field]: value }));
	}

	function handleApplyComparativasFilters() {
		setAppliedComparativasFilters(comparativasFilters);
		setEstadisticas([]);
		setEstadisticasError(null);
	}

	function handleClearComparativasFilters() {
		const reset = getDefaultComparativasFilters();
		setComparativasFilters(reset);
		setAppliedComparativasFilters(reset);
		setCompareIds([]);
		setCompareSearch("");
		setEstadisticas([]);
		setEstadisticasError(null);
	}

	function handleToggleCompare(limnigrafoId: string, checked: boolean) {
		setCompareIds((prev) => {
			if (checked) {
				return prev.includes(limnigrafoId) ? prev : [...prev, limnigrafoId];
			}
			return prev.filter((id) => id !== limnigrafoId);
		});
	}

	function handleSelectAllCompare() {
		setCompareIds(limnigrafos.map((limnigrafo) => String(limnigrafo.id)));
	}

	function handleSelectFilteredCompare() {
		setCompareIds((prev) => {
			const next = new Set(prev);
			filteredCompareLimnigrafos.forEach((limnigrafo) => {
				next.add(String(limnigrafo.id));
			});
			return Array.from(next);
		});
	}

	function handleClearCompareSelection() {
		setCompareIds([]);
	}

	function handleTimeRangeChange(value: string) {
		if (value === "90d" || value === "30d" || value === "7d") {
			setTimeRange(value);
		}
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">Inicio</h1>
						<p className="text-base text-[#4D5562] dark:text-[#94A3B8]">
							Resumen operativo con alertas, métricas rápidas y comparativas de mediciones.
						</p>
					</header>

					{topError ? (
						<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
							No se pudieron cargar todos los datos del inicio. Verificá la conexión con el backend.
						</p>
					) : null}

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
								Estados críticos
							</p>
							<span className="rounded-full bg-[#F1F5F9] px-4 py-1 text-[13px] font-semibold text-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]">
								{loadingLimnigrafos || loadingMediciones ? "Cargando..." : `${homeLimnigrafos.length} en alerta`}
							</span>
						</div>
						<TablaHome
							data={homeLimnigrafos}
							className="max-h-[45vh] overflow-y-auto"
						/>
					</section>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="mb-6">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Métricas rápidas</p>
							<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
								Resumen de {atributoSeleccionado.label.toLowerCase()} para el rango seleccionado.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							<MetricaCard
								title="Registros en período"
								value={String(resumenMetricas.totalRegistros)}
								detail={`Ventana: ${TIME_RANGE_LABEL[timeRange]}`}
								accent="#0EA5E9"
							/>
							<MetricaCard
								title="Promedio"
								value={formatAtributoValue(resumenMetricas.promedio, appliedComparativasFilters.atributo)}
								detail={`Atributo: ${atributoSeleccionado.label}`}
								accent="#22C55E"
							/>
							<MetricaCard
								title="Rango"
								value={`${formatAtributoValue(resumenMetricas.minimo, appliedComparativasFilters.atributo)} / ${formatAtributoValue(resumenMetricas.maximo, appliedComparativasFilters.atributo)}`}
								detail="Mínimo / Máximo"
								accent="#F97316"
							/>
							<MetricaCard
								title="Última medición"
								value={resumenMetricas.ultimaMedicion ? `${new Date(resumenMetricas.ultimaMedicion.fecha_hora).toLocaleDateString("es-AR")} ${new Date(resumenMetricas.ultimaMedicion.fecha_hora).toLocaleTimeString("es-AR", {
									hour: "2-digit",
									minute: "2-digit",
								})}` : "-"}
								detail={resumenMetricas.ultimaMedicion ? (limnigrafoNameById.get(resumenMetricas.ultimaMedicion.limnigrafo) ?? `ID ${resumenMetricas.ultimaMedicion.limnigrafo}`) : "Sin datos"}
								accent="#A855F7"
							/>
						</div>
					</section>

					<Card className="rounded-[24px] border-none bg-white pt-0 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<CardHeader className="flex items-start gap-3 space-y-0 border-b border-[#E2E8F0] py-5 lg:flex-row dark:border-[#334155]">
							<div className="grid flex-1 gap-1">
								<CardTitle className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
									Evolución temporal
								</CardTitle>
								<CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
									Serie de {atributoSeleccionado.label.toLowerCase()} para limnígrafos seleccionados.
									Actualización automática cada 30 segundos.
								</CardDescription>
							</div>

							<div className="flex w-full flex-col gap-1 sm:w-[160px]">
								<label htmlFor="chart-time-range" className="text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
									Ventana
								</label>
								<select
									id="chart-time-range"
									value={timeRange}
									onChange={(event) => handleTimeRangeChange(event.target.value)}
									className="rounded-lg border border-[#D3D4D5] bg-white px-3 py-2 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
								>
									<option value="90d">Últimos 90 días</option>
									<option value="30d">Últimos 30 días</option>
									<option value="7d">Últimos 7 días</option>
								</select>
							</div>

							<div className="flex w-full flex-col gap-1 sm:w-[190px]">
								<label htmlFor="chart-limnigrafos-trigger" className="text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
									Limnígrafos ({compareIds.length} seleccionados)
								</label>
								<div>
									<MultiSelect
										id="chart-limnigrafos-trigger"
										options={chartLimnigrafoOptions}
										selectedValues={compareIds}
										onChange={setCompareIds}
										placeholder="Seleccionar limnígrafos"
										className="h-10"
										emptyText="No hay limnígrafos disponibles"
									/>
								</div>
								<p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Abrí el selector para elegir uno o varios.</p>
							</div>
						</CardHeader>

						<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
							{hasChartError ? (
								<p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
									No se pudieron cargar los datos para el gráfico.
								</p>
							) : null}

							{loadingComparativas ? (
								<div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
									Cargando gráfico...
								</div>
							) : chartSeries.length === 0 ? (
								<div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
									Seleccioná al menos un limnígrafo para visualizar la evolución temporal.
								</div>
							) : filteredChartData.length === 0 ? (
								<div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
									No hay datos para graficar en la ventana seleccionada.
								</div>
							) : (
								<ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
									<AreaChart data={filteredChartData}>
										<defs>
											{chartSeries.map((serie) => (
												<linearGradient key={serie.dataKey} id={`fill-${serie.dataKey}`} x1="0" y1="0" x2="0" y2="1">
													<stop
														offset="5%"
														stopColor={`var(--color-${serie.dataKey})`}
														stopOpacity={0.8}
													/>
													<stop
														offset="95%"
														stopColor={`var(--color-${serie.dataKey})`}
														stopOpacity={0.1}
													/>
												</linearGradient>
											))}
										</defs>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="date"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
											minTickGap={32}
											tickFormatter={(value) => new Date(value).toLocaleDateString("es-AR", {
												month: "short",
												day: "2-digit",
											})}
										/>
										<YAxis tickLine={false} axisLine={false} width={56} />
										<ChartTooltip
											cursor={false}
											content={(
												<ChartTooltipContent
													labelFormatter={(value) => new Date(String(value)).toLocaleString("es-AR", {
														month: "short",
														day: "2-digit",
														hour: "2-digit",
														minute: "2-digit",
													})}
													indicator="dot"
												/>
											)}
										/>
										{chartSeries.map((serie) => (
											<Area
												key={serie.dataKey}
												dataKey={serie.dataKey}
												type="natural"
												fill={`url(#fill-${serie.dataKey})`}
												stroke={`var(--color-${serie.dataKey})`}
												strokeWidth={2}
												connectNulls
												isAnimationActive={false}
											/>
										))}
										<ChartLegend content={<ChartLegendContent />} />
									</AreaChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<SeccionComparativasMediciones
						filters={comparativasFilters}
						onDesdeChange={(value) => handleComparativasFilterChange("desde", value)}
						onHastaChange={(value) => handleComparativasFilterChange("hasta", value)}
						onAtributoChange={(value) => handleComparativasFilterChange("atributo", value)}
						onApplyFilters={handleApplyComparativasFilters}
						onClearFilters={handleClearComparativasFilters}
						onCalcular={handleCalcularEstadisticas}
						isCalculando={postEstadistica.isPending}
						compareSearch={compareSearch}
						onCompareSearchChange={setCompareSearch}
						onSelectAll={handleSelectAllCompare}
						onSelectVisible={handleSelectFilteredCompare}
						onClearSelection={handleClearCompareSelection}
						onToggleSelection={handleToggleCompare}
						limnigrafosTotales={limnigrafos.length}
						filteredLimnigrafos={filteredCompareLimnigrafos}
						compareIds={compareIds}
						estadisticasError={estadisticasError}
						estadisticas={estadisticas}
						limnigrafoNameById={limnigrafoNameById}
					/>
				</div>
			</main>
		</PaginaBase>
	);
}
