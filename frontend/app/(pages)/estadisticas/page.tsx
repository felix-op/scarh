"use client";

import { useMemo, useState } from "react";
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
import PanelComparativas from "./componentes/PanelComparativas";
import useEstadisticasMediciones from "./hooks/useEstadisticasMediciones";
import useRateAnalysis from "./hooks/useRateAnalysis";
import {
	type EstadisticaAtributo,
	type EstadisticasFilters,
	type EstadisticasTab,
	type ModoFiltro,
	type TablaComparativaFilters,
	type VentanaRealtime,
	ATRIBUTO_METADATA,
	MIN_RATE_INTERVAL_MS,
	RATE_MAD_Z_THRESHOLD,
	REALTIME_WINDOW_LABELS,
	computeSummary,
	formatDateTick,
	formatDateTime,
	formatMetricValue,
	formatNumber,
	formatVariation,
	getDefaultFilters,
	getDefaultTablaComparativaFilters,
	getMedicionValueByAtributo,
	toIsoString,
} from "./lib/estadisticas-domain";
import TablaComparativaEstadisticas from "./componentes/TablaComparativaEstadisticas";

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

export default function EstadisticasPage() {
	const [activeTab, setActiveTab] = useState<EstadisticasTab>("graficos");
	const [filters, setFilters] = useState<EstadisticasFilters>(getDefaultFilters);
	const [appliedFilters, setAppliedFilters] = useState<EstadisticasFilters>(getDefaultFilters);
	const [filterError, setFilterError] = useState<string | null>(null);
	const [tablaFilters, setTablaFilters] = useState<TablaComparativaFilters>(getDefaultTablaComparativaFilters);
	const [tablaAppliedFilters, setTablaAppliedFilters] = useState<TablaComparativaFilters>(getDefaultTablaComparativaFilters);
	const [tablaFilterError, setTablaFilterError] = useState<string | null>(null);

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
	const {
		isLoadingData,
		fetchError,
		lastUpdatedAt,
		activeRange,
		parsedMediciones,
		currentRows,
		previousRows,
	} = useEstadisticasMediciones(appliedFilters);

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

	const {
		activeDurationMs,
		rawRatePoints,
		discardedRatePoints,
		rateSeriesData,
		rateSummary,
	} = useRateAnalysis(currentRows, activeRange);

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

							{noDataInRange ? (
								<p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#475569] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#CBD5E1]">
									No se encontraron mediciones en el período y filtros seleccionados.
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
