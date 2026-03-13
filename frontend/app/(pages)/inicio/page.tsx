"use client";

import TablaHome from "@componentes/TablaHome";
import MetricaCard from "@componentes/MetricaCard";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { type ColumnConfig } from "@componentes/tabla/types";
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
import { mapearEstado } from "@lib/transformers/limnigrafoTransformer";
import { useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ComparativasFilters } from "../mediciones/secciones/types";
import { toDatetimeLocalInputValue } from "../mediciones/utils";

// Prioridad de estados para ordenamiento (menor = más urgente)
const estadoPriority: Record<string, number> = {
	fuera: 0,
	peligro: 1,
	advertencia: 2,
	prueba: 3,
	activo: 4,
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

type ComparativaTableRow = {
	rowId: string;
	limnigrafo: string;
	minimo: string;
	maximo: string;
	desvioEstandar: string;
	percentil90: string;
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

function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}
	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function getStartDateFromRange(reference: Date, range: TimeRange): Date {
	const start = new Date(reference);
	start.setDate(start.getDate() - TIME_RANGE_DAYS[range]);
	return start;
}

export default function Home() {
	const [comparativasFilters, setComparativasFilters] = useState<ComparativasFilters>(getDefaultComparativasFilters);
	const [compareIds, setCompareIds] = useState<string[]>([]);
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");
	const [estadisticas, setEstadisticas] = useState<EstadisticaOutputItem[]>([]);
	const [estadisticasError, setEstadisticasError] = useState<string | null>(null);
	const statsRequestIdRef = useRef(0);

	const { data: limnigrafosData, error: limnigrafosError } = useGetLimnigrafos({
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

	const { data: medicionesRecientesData, error: medicionesRecientesError } = useGetMediciones({
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

	const { mutateAsync: calcularEstadistica, isPending: isCalculandoEstadisticas } = usePostEstadistica();

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

	const limnigrafosSeleccionadosParaEstadisticas = useMemo(
		() => compareIds
			.map((item) => Number.parseInt(item, 10))
			.filter((item) => !Number.isNaN(item)),
		[compareIds],
	);

	const rangoEstadisticas = useMemo(() => {
		const desdeIso = toIsoString(comparativasFilters.desde);
		const hastaIso = toIsoString(comparativasFilters.hasta);
		return { desdeIso, hastaIso };
	}, [comparativasFilters.desde, comparativasFilters.hasta]);

	const estadisticasRequest = useMemo(() => {
		if (limnigrafosSeleccionadosParaEstadisticas.length === 0 || !rangoEstadisticas.desdeIso || !rangoEstadisticas.hastaIso) {
			return null;
		}

		return {
			limnigrafos: limnigrafosSeleccionadosParaEstadisticas,
			atributo: comparativasFilters.atributo,
			fecha_inicio: rangoEstadisticas.desdeIso,
			fecha_fin: rangoEstadisticas.hastaIso,
		};
	}, [comparativasFilters.atributo, limnigrafosSeleccionadosParaEstadisticas, rangoEstadisticas]);

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
		if (limnigrafos.length === 0) {
			return [];
		}

		return limnigrafos
			.map((limnigrafo) => {
				const medicionReciente = medicionesMap.get(limnigrafo.id);
				const medicion = medicionReciente ?? limnigrafo.ultima_medicion;
				const fechaUltimoRegistro = medicion?.fecha_hora ?? limnigrafo.ultima_conexion;
				const fechaRegistro = fechaUltimoRegistro ? new Date(fechaUltimoRegistro) : null;
				const ultimoRegistro = fechaRegistro && !Number.isNaN(fechaRegistro.getTime())
					? `${fechaRegistro.toLocaleDateString("es-AR")} ${fechaRegistro.toLocaleTimeString("es-AR", {
						hour: "2-digit",
						minute: "2-digit",
					})}`
					: "Sin registros";

				return {
					id: String(limnigrafo.id),
					nombre: limnigrafo.codigo,
					nivel_de_bateria: medicionReciente?.nivel_de_bateria !== null
						&& medicionReciente?.nivel_de_bateria !== undefined
						? `${formatNumber(medicionReciente.nivel_de_bateria, 1)} %`
						: "-",
					estado: mapearEstado(limnigrafo.estado),
					ultimoRegistro,
					altura: medicion?.altura_agua !== null && medicion?.altura_agua !== undefined
						? `${formatNumber(medicion.altura_agua, 2)} m`
						: "-",
					temperatura: medicion?.temperatura !== null && medicion?.temperatura !== undefined
						? `${formatNumber(medicion.temperatura, 2)} °C`
						: "-",
					presion: medicion?.presion !== null && medicion?.presion !== undefined
						? `${formatNumber(medicion.presion, 2)} hPa`
						: "-",
				};
			})
			.sort((a, b) => {
				const priorityA = estadoPriority[a.estado.variante ?? ""] ?? 4;
				const priorityB = estadoPriority[b.estado.variante ?? ""] ?? 4;
				if (priorityA !== priorityB) {
					return priorityA - priorityB;
				}
				return a.nombre.localeCompare(b.nombre, "es");
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
			const value = getMedicionValueByAtributo(medicion, comparativasFilters.atributo);
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
	}, [chartSeries, comparativasFilters.atributo, medicionesComparativas]);

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
			.map((medicion) => getMedicionValueByAtributo(medicion, comparativasFilters.atributo))
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
	}, [chartData, chartSeries, comparativasFilters.atributo, medicionesComparativas, timeRange]);

	const topError = limnigrafosError ?? medicionesRecientesError;
	const atributoSeleccionado = ATRIBUTO_METADATA[comparativasFilters.atributo];
	const hasChartError = Boolean(medicionesComparativasError);
	const disableCalcularComparativas = !estadisticasRequest || isCalculandoEstadisticas;
	const shouldShowEstadisticas = limnigrafosSeleccionadosParaEstadisticas.length > 0
		&& Boolean(rangoEstadisticas.desdeIso && rangoEstadisticas.hastaIso);
	const estadisticasVisibles = useMemo(
		() => (shouldShowEstadisticas ? estadisticas : []),
		[estadisticas, shouldShowEstadisticas],
	);
	const estadisticasErrorVisible = shouldShowEstadisticas ? estadisticasError : null;
	const comparativaRows = useMemo<ComparativaTableRow[]>(
		() =>
			estadisticasVisibles.map((item, index) => ({
				rowId: `${item.id ?? "global"}-${index}`,
				limnigrafo: item.id === null ? "Global" : (limnigrafoNameById.get(item.id) ?? `ID ${item.id}`),
				minimo: formatNumber(item.minimo, 2),
				maximo: formatNumber(item.maximo, 2),
				desvioEstandar: formatNumber(item.desvio_estandar, 2),
				percentil90: formatNumber(item.percentil_90, 2),
			})),
		[estadisticasVisibles, limnigrafoNameById],
	);

	const comparativaColumns = useMemo<ColumnConfig<ComparativaTableRow>[]>(
		() => [
			{
				id: "limnigrafo",
				header: "Limnígrafo",
				cell: (row) => <span className="px-4 py-3 font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{row.limnigrafo}</span>,
			},
			{
				id: "minimo",
				header: "Mínimo",
				accessorKey: "minimo",
			},
			{
				id: "maximo",
				header: "Máximo",
				accessorKey: "maximo",
			},
			{
				id: "desvioEstandar",
				header: "Desv. estándar",
				accessorKey: "desvioEstandar",
			},
			{
				id: "percentil90",
				header: "Percentil 90",
				accessorKey: "percentil90",
			},
		],
		[],
	);

	async function handleCalcularComparativas() {
		if (!estadisticasRequest) {
			return;
		}

		const requestId = statsRequestIdRef.current + 1;
		statsRequestIdRef.current = requestId;

		try {
			setEstadisticasError(null);
			const result = await calcularEstadistica({
				data: estadisticasRequest,
			});

			if (statsRequestIdRef.current !== requestId) {
				return;
			}

			setEstadisticas(result);
		} catch (error) {
			if (statsRequestIdRef.current !== requestId) {
				return;
			}

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
						<div className="mb-4">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
								Estados críticos y último registro
							</p>
						</div>
						<TablaHome
							data={homeLimnigrafos}
							className="max-h-[clamp(260px,50vh,620px)] !overflow-y-auto overscroll-y-contain"
						/>
					</section>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="flex flex-col gap-5">
							<div className="space-y-1">
								<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Filtros</p>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
								<label className="flex flex-col gap-2 text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
									Atributo
									<select
										value={comparativasFilters.atributo}
										onChange={(event) => handleComparativasFilterChange("atributo", event.target.value as EstadisticaAtributo)}
										className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
									>
										<option value="altura_agua">Altura del agua</option>
										<option value="presion">Presión</option>
										<option value="temperatura">Temperatura</option>
									</select>
								</label>

								<label htmlFor="global-time-range" className="flex flex-col gap-2 text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
									Ventana
									<select
										id="global-time-range"
										value={timeRange}
										onChange={(event) => handleTimeRangeChange(event.target.value)}
										className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
									>
										<option value="90d">Últimos 90 días</option>
										<option value="30d">Últimos 30 días</option>
										<option value="7d">Últimos 7 días</option>
									</select>
								</label>

								<div className="flex flex-col gap-2">
									<label htmlFor="global-limnigrafos-trigger" className="text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
										Limnígrafos ({compareIds.length})
									</label>
									<MultiSelect
										id="global-limnigrafos-trigger"
										options={chartLimnigrafoOptions}
										selectedValues={compareIds}
										onChange={setCompareIds}
										placeholder="Seleccionar limnígrafos"
										className="h-9 text-[12px]"
										emptyText="No hay limnígrafos disponibles"
									/>
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
									Seleccionados: {compareIds.length} de {limnigrafos.length}
								</span>
							</div>
						</div>
					</section>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="mb-6">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
								Resumen de {atributoSeleccionado.label.toLowerCase()} para la ventana seleccionada.
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
								value={formatAtributoValue(resumenMetricas.promedio, comparativasFilters.atributo)}
								detail={`Atributo: ${atributoSeleccionado.label}`}
								accent="#22C55E"
							/>
							<MetricaCard
								title="Rango"
								value={`${formatAtributoValue(resumenMetricas.minimo, comparativasFilters.atributo)} / ${formatAtributoValue(resumenMetricas.maximo, comparativasFilters.atributo)}`}
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
						<CardHeader className="space-y-0 border-b border-[#E2E8F0] py-5 dark:border-[#334155]">
							<div className="grid flex-1 gap-1">
								<CardTitle className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
									Evolución temporal
								</CardTitle>
								<CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
									Serie de {atributoSeleccionado.label.toLowerCase()} para limnígrafos seleccionados ({compareIds.length}).
									Ventana actual: {TIME_RANGE_LABEL[timeRange]}. Actualización automática cada 30 segundos.
								</CardDescription>
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

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="mb-4">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
								Resultados comparativos
							</p>
							<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
								Seleccione el rango de fechas específico para calcular los resultados comparativos.
							</p>
						</div>

						<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
							<label className="flex flex-col gap-2 text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
								Desde
								<input
									type="datetime-local"
									value={comparativasFilters.desde}
									onChange={(event) => handleComparativasFilterChange("desde", event.target.value)}
									className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
								/>
							</label>
							<label className="flex flex-col gap-2 text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
								Hasta
								<input
									type="datetime-local"
									value={comparativasFilters.hasta}
									onChange={(event) => handleComparativasFilterChange("hasta", event.target.value)}
									className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
								/>
							</label>
						</div>

						<div className="mb-4 flex flex-wrap items-center justify-end gap-3">
							<button
								type="button"
								onClick={handleCalcularComparativas}
								disabled={disableCalcularComparativas}
								className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2563EB] dark:bg-[#0B2A43] dark:text-[#93C5FD]"
							>
								{isCalculandoEstadisticas ? "Calculando..." : "Calcular estadísticas"}
							</button>
						</div>

						{estadisticasErrorVisible ? (
							<p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
								{estadisticasErrorVisible}
							</p>
						) : null}

						<DataTable
							data={comparativaRows}
							columns={comparativaColumns}
							rowIdKey="rowId"
							showTopBar={false}
							enableRowAnimation={false}
							minWidth={760}
							emptyStateContent={<span className="text-[#6B7280] dark:text-[#94A3B8]">Sin datos comparativos calculados.</span>}
							styles={{
								rootClassName: "pb-0",
								cardClassName: "rounded-[20px] border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)] dark:border-[#334155] dark:bg-[#0F172A] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.45)]",
								scrollerClassName: "overflow-x-auto",
								tableClassName: "min-w-full text-left text-[14px] text-[#2F2F2F] dark:text-[#CBD5E1]",
								theadClassName: "bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B] border-none dark:bg-[#111923] dark:text-[#94A3B8]",
								headerCellClassName: "px-4 py-3",
								tbodyClassName: "divide-y divide-[#EAEAEA] dark:divide-[#334155]",
								rowClassName: "border-0 hover:bg-[#F9FBFF] dark:hover:bg-[#1E293B]",
								cellClassName: "align-middle p-4",
								emptyCellClassName: "px-4 py-8 text-center",
							}}
						/>
					</section>
				</div>
			</main>
		</PaginaBase>
	);
}
