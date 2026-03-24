"use client";

import { useMemo, useState } from "react";
import PaginaBase from "@componentes/base/PaginaBase";
import EstadisticaCard from "@componentes/EstadisticaCard";
import { type MultiSelectOption } from "@componentes/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@componentes/components/ui/tabs";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { LimnigrafoResponse } from "types/limnigrafos";
import FiltrosGraficosEstadisticas from "./componentes/FiltrosGraficosEstadisticas";
import FiltrosTablaComparativa from "./componentes/FiltrosTablaComparativa";
import PanelComparativas from "./componentes/PanelComparativas";
import TablaComparativaEstadisticas from "./componentes/TablaComparativaEstadisticas";
import TarjetaCalidadOperativaCarga, { type FuenteChartDatum } from "./componentes/TarjetaCalidadOperativaCarga";
import TarjetaTasaCambioNivel from "./componentes/TarjetaTasaCambioNivel";
import useEstadisticasMediciones from "./hooks/useEstadisticasMediciones";
import useRateAnalysis from "./hooks/useRateAnalysis";
import {
	type EstadisticasFilters,
	type EstadisticasTab,
	type TablaComparativaFilters,
	ATRIBUTO_METADATA,
	computeSummary,
	formatDateTime,
	formatMetricValue,
	formatVariation,
	getDefaultFilters,
	getDefaultTablaComparativaFilters,
	getMedicionValueByAtributo,
	toIsoString,
} from "./lib/estadisticas-domain";

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
		let importCsv = 0;
		let importJson = 0;

		currentRows.forEach((medicion) => {
			if (medicion.fuente === "manual") {
				manual += 1;
				return;
			}

			if (medicion.fuente === "import_csv") {
				importCsv += 1;
				return;
			}

			if (medicion.fuente === "import_json") {
				importJson += 1;
				return;
			}

			automatico += 1;
		});

		const total = automatico + manual + importCsv + importJson;
		const automaticoPct = total > 0 ? (automatico / total) * 100 : 0;
		const manualPct = total > 0 ? (manual / total) * 100 : 0;
		const importCsvPct = total > 0 ? (importCsv / total) * 100 : 0;
		const importJsonPct = total > 0 ? (importJson / total) * 100 : 0;

		return {
			automatico,
			manual,
			importCsv,
			importJson,
			total,
			automaticoPct,
			manualPct,
			importCsvPct,
			importJsonPct,
		};
	}, [currentRows]);

	const fuenteChartData = useMemo<FuenteChartDatum[]>(
		() => [
			{ key: "automatico", label: "Automático", value: fuenteStats.automatico, fill: "#22C55E" },
			{ key: "manual", label: "Manual", value: fuenteStats.manual, fill: "#F97316" },
			{ key: "import_csv", label: "Importación CSV", value: fuenteStats.importCsv, fill: "#8B5CF6" },
			{ key: "import_json", label: "Importación JSON", value: fuenteStats.importJson, fill: "#0EA5E9" },
		],
		[fuenteStats.automatico, fuenteStats.importCsv, fuenteStats.importJson, fuenteStats.manual],
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
							<FiltrosGraficosEstadisticas
								filters={filters}
								appliedFilters={appliedFilters}
								activeRangeLabel={activeRangeLabel}
								limnigrafoOptions={limnigrafoOptions}
								setFilters={setFilters}
								onApply={handleApplyFilters}
								onReset={handleResetFilters}
							/>

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
								<TarjetaTasaCambioNivel
									activeDurationMs={activeDurationMs}
									rawRatePointsCount={rawRatePoints.length}
									discardedRatePoints={discardedRatePoints}
									rateSeriesData={rateSeriesData}
									rateSummary={rateSummary}
								/>
							) : null}

							<TarjetaCalidadOperativaCarga
								fuenteStats={fuenteStats}
								fuenteChartData={fuenteChartData}
							/>

						</TabsContent>

						<TabsContent value="tabla" className="mt-0 flex flex-col gap-8">
							<FiltrosTablaComparativa
								filters={tablaFilters}
								limnigrafoOptions={limnigrafoOptions}
								setFilters={setTablaFilters}
								onApply={handleApplyTablaFilters}
								onReset={handleResetTablaFilters}
							/>

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
