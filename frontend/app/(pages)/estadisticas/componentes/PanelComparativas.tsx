"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@componentes/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import {
	type EstadisticaAtributo,
	type MedicionPaginatedResponse,
	type MedicionResponse,
	useGetMediciones,
} from "@servicios/api/django.api";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type LimnigrafoResponse } from "types/limnigrafos";

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

type SharedTimeRange = "1h" | "6h" | "24h" | "7d" | "30d" | "90d";

type PanelComparativasProps = {
	limnigrafos: LimnigrafoResponse[];
	limnigrafosError: unknown;
	chartAtributo: EstadisticaAtributo;
	chartLimnigrafos: string[];
	chartTimeRange: SharedTimeRange;
};

const WINDOW_DURATION_MS: Record<SharedTimeRange, number> = {
	"1h": 60 * 60 * 1000,
	"6h": 6 * 60 * 60 * 1000,
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
	"30d": 30 * 24 * 60 * 60 * 1000,
	"90d": 90 * 24 * 60 * 60 * 1000,
};

const TIME_RANGE_LABEL: Record<SharedTimeRange, string> = {
	"1h": "Última hora",
	"6h": "Últimas 6 horas",
	"24h": "Últimas 24 horas",
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

function toNumericTooltipValue(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}

function getStartDateFromRange(reference: Date, range: SharedTimeRange): Date {
	return new Date(reference.getTime() - WINDOW_DURATION_MS[range]);
}

export default function PanelComparativas({
	limnigrafos,
	limnigrafosError,
	chartAtributo,
	chartLimnigrafos,
	chartTimeRange,
}: PanelComparativasProps) {
	const comparativasQueryParams = useMemo(() => {
		const now = new Date();
		const from = new Date(now.getTime() - WINDOW_DURATION_MS["90d"]);

		return {
			limit: String(CHART_PAGE_SIZE),
			page: "1",
			fecha_desde: from.toISOString(),
		};
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
		},
	});

	const limnigrafoNameById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);

	const medicionesComparativas = useMemo(
		() => ((medicionesComparativasData as MedicionPaginatedResponse | undefined)?.results ?? []),
		[medicionesComparativasData],
	);

	const limnigrafosSeleccionados = useMemo(
		() => chartLimnigrafos
			.map((item) => Number.parseInt(item, 10))
			.filter((item) => !Number.isNaN(item)),
		[chartLimnigrafos],
	);

	const chartSeries = useMemo<ChartSerie[]>(() => {
		return chartLimnigrafos
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
	}, [chartLimnigrafos, limnigrafoNameById]);

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
			const value = getMedicionValueByAtributo(medicion, chartAtributo);
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
	}, [chartAtributo, chartSeries, medicionesComparativas]);

	const filteredChartData = useMemo(() => {
		if (chartData.length === 0) {
			return [];
		}

		const referenceDate = new Date(chartData[chartData.length - 1].date);
		const startDate = getStartDateFromRange(referenceDate, chartTimeRange);

		return chartData.filter((point) => {
			const date = new Date(point.date);
			return date >= startDate;
		});
	}, [chartData, chartTimeRange]);

	const atributoSeleccionado = ATRIBUTO_METADATA[chartAtributo];
	const hasChartError = Boolean(medicionesComparativasError);

	return (
		<>
			{limnigrafosError ? (
				<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
					No se pudieron cargar los limnígrafos para la comparativa.
				</p>
			) : null}

			<Card className="rounded-[24px] border-none bg-white pt-0 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
				<CardHeader className="space-y-0 border-b border-[#E2E8F0] py-5 dark:border-[#334155]">
					<div className="grid flex-1 gap-1">
						<CardTitle className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
							Evolución temporal
						</CardTitle>
						<CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
							Serie de {atributoSeleccionado.label.toLowerCase()} para limnígrafos seleccionados ({limnigrafosSeleccionados.length}).
							Ventana actual: {TIME_RANGE_LABEL[chartTimeRange]}. Actualización automática cada 30 segundos.
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
											formatter={(value, name, item) => {
												const numericValue = toNumericTooltipValue(value);
												const indicatorColor = typeof item?.color === "string" ? item.color : undefined;
												return (
													<div className="flex w-full items-center justify-between gap-3">
														<span className="flex items-center gap-2 text-muted-foreground">
															<span
																className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
																style={{ backgroundColor: indicatorColor }}
															/>
															<span>{String(name)}</span>
														</span>
														<span className="font-mono font-medium text-foreground tabular-nums">
															{formatAtributoValue(numericValue, chartAtributo)}
														</span>
													</div>
												);
											}}
											indicator="dot"
										/>
									)}
								/>
								{chartSeries.map((serie) => (
									<Area
										key={serie.dataKey}
										dataKey={serie.dataKey}
										name={serie.label}
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
		</>
	);
}
