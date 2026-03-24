"use client";

import { useMemo, useState } from "react";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import {
	formatDateTick,
	formatDateTime,
	formatNumber,
	MIN_RATE_INTERVAL_MS,
	RATE_MAD_Z_THRESHOLD,
} from "../lib/estadisticas-domain";
import { type RateByLimnigrafo } from "../hooks/useRateAnalysis";

const rateChartConfig: ChartConfig = {
	rate: { label: "Tasa de cambio", color: "#F97316" },
};

type TarjetaTasaCambioNivelProps = {
	activeDurationMs: number;
	rawRatePointsCount: number;
	discardedRatePoints: number;
	rateSeriesData: Array<{ date: string; rate: number }>;
	rateSummary: {
		promedio: number | null;
		maxSubida: number | null;
		maxBajada: number | null;
	};
	rateByLimnigrafo: RateByLimnigrafo[];
	limnigrafoLabels: Record<number, string>;
	candidateLimnigrafoIds: number[];
};

export default function TarjetaTasaCambioNivel({
	activeDurationMs,
	rawRatePointsCount,
	discardedRatePoints,
	rateSeriesData,
	rateSummary,
	rateByLimnigrafo,
	limnigrafoLabels,
	candidateLimnigrafoIds,
}: TarjetaTasaCambioNivelProps) {
	const [viewMode, setViewMode] = useState<"consolidada" | "individual">("consolidada");
	const [selectedLimnigrafoId, setSelectedLimnigrafoId] = useState<string>("");

	const rateByLimnigrafoMap = useMemo(
		() => new Map<number, RateByLimnigrafo>(rateByLimnigrafo.map((item) => [item.limnigrafoId, item])),
		[rateByLimnigrafo],
	);
	const selectorOptions = useMemo(
		() => candidateLimnigrafoIds.map((limnigrafoId) => {
			const rateData = rateByLimnigrafoMap.get(limnigrafoId) ?? null;
			const hasRateData = (rateData?.rawRatePoints.length ?? 0) > 0;
			return {
				limnigrafoId,
				label: limnigrafoLabels[limnigrafoId] ?? `ID ${limnigrafoId}`,
				rateData,
				hasRateData,
			};
		}),
		[candidateLimnigrafoIds, limnigrafoLabels, rateByLimnigrafoMap],
	);

	const resolvedSelectedLimnigrafoId = useMemo(() => {
		if (selectorOptions.length === 0) {
			return "";
		}

		const hasSelected = selectorOptions.some((item) => String(item.limnigrafoId) === selectedLimnigrafoId);
		if (hasSelected) {
			return selectedLimnigrafoId;
		}

		const firstWithData = selectorOptions.find((item) => item.hasRateData);
		return String((firstWithData ?? selectorOptions[0]).limnigrafoId);
	}, [selectedLimnigrafoId, selectorOptions]);

	const selectedOption = useMemo(
		() => selectorOptions.find((item) => String(item.limnigrafoId) === resolvedSelectedLimnigrafoId) ?? null,
		[resolvedSelectedLimnigrafoId, selectorOptions],
	);
	const selectedRateData = selectedOption?.rateData ?? null;

	const isIndividualView = viewMode === "individual";
	const effectiveRateSeriesData = isIndividualView
		? selectedRateData?.rateSeriesData ?? []
		: rateSeriesData;
	const effectiveRawRatePointsCount = isIndividualView
		? selectedRateData?.rawRatePoints.length ?? 0
		: rawRatePointsCount;
	const effectiveDiscardedRatePoints = isIndividualView
		? selectedRateData?.discardedRatePoints ?? 0
		: discardedRatePoints;
	const effectiveRateSummary = isIndividualView
		? selectedRateData?.rateSummary ?? { promedio: null, maxSubida: null, maxBajada: null }
		: rateSummary;

	const selectedLimnigrafoLabel = selectedOption
		? selectedOption.label
		: null;

	const emptyRateMessage = isIndividualView
		? "El limnígrafo seleccionado no tiene datos suficientes de nivel para calcular tasas."
		: "No hay datos suficientes de nivel para calcular tasas.";

	return (
		<section className="grid gap-6 lg:grid-cols-1">
			<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
				<div className="mb-4">
					<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
						Tasa de cambio del nivel del agua
					</p>
					<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
						{isIndividualView
							? `Cálculo de subida/bajada (m/h) para ${selectedLimnigrafoLabel ?? "un limnígrafo"} entre mediciones consecutivas.`
							: "Cálculo de subida/bajada (m/h) entre mediciones consecutivas."}
					</p>
				</div>

				<div className="mb-4 flex flex-wrap items-end gap-3">
					<div className="inline-flex rounded-xl border border-[#CBD5E1] bg-white p-1 dark:border-[#334155] dark:bg-[#0F172A]">
						<button
							type="button"
							onClick={() => setViewMode("consolidada")}
							className={[
								"rounded-lg px-3 py-1.5 text-[12px] font-semibold transition",
								viewMode === "consolidada"
									? "bg-[#0982C8] text-white"
									: "text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]",
							].join(" ")}
						>
							Consolidada
						</button>
						<button
							type="button"
							onClick={() => setViewMode("individual")}
							className={[
								"rounded-lg px-3 py-1.5 text-[12px] font-semibold transition",
								viewMode === "individual"
									? "bg-[#0982C8] text-white"
									: "text-[#334155] hover:bg-[#F1F5F9] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]",
							].join(" ")}
						>
							Individual
						</button>
					</div>

					{isIndividualView ? (
						<label className="flex min-w-[240px] flex-col gap-1 text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
							Limnígrafo
							<select
								value={resolvedSelectedLimnigrafoId}
								onChange={(event) => setSelectedLimnigrafoId(event.target.value)}
								className="rounded-xl border border-[#D3D4D5] bg-white p-2 text-[13px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
							>
								{selectorOptions.map((item) => (
									<option
										key={item.limnigrafoId}
										value={String(item.limnigrafoId)}
										disabled={!item.hasRateData}
									>
										{item.hasRateData ? item.label : `${item.label} (sin datos de tasa)`}
									</option>
								))}
							</select>
						</label>
					) : null}
				</div>
				{isIndividualView ? (
					<p className="mb-4 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
						Los limnígrafos deshabilitados no tienen tasa calculable en el rango y filtros aplicados.
						Para mostrar la tasa se requieren al menos 2 mediciones consecutivas de nivel del agua, separadas por al menos {MIN_RATE_INTERVAL_MS / (60 * 1000)} min y válidas tras el control de calidad (MAD).
					</p>
				) : null}

				{effectiveRateSeriesData.length === 0 ? (
					<div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#94A3B8]">
						{emptyRateMessage}
					</div>
				) : (
					<ChartContainer config={rateChartConfig} className="h-[280px] w-full">
						<LineChart data={effectiveRateSeriesData}>
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
						Intervalos usados para calcular la tasa: <span className="font-semibold">{effectiveRawRatePointsCount}</span>
					</p>
					<p>
						Intervalos excluidos por control de calidad: <span className="font-semibold">{effectiveDiscardedRatePoints}</span>
					</p>
					<p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
						<span className="font-semibold">Criterio de calidad:</span> se excluyen intervalos con
						{" "}
						<span className="font-semibold">menos de 1 minuto</span>
						{" "}
						entre mediciones y cambios atípicos detectados automáticamente
						{" "}
						<span className="font-semibold">(mediana + MAD, |z| &gt; {RATE_MAD_Z_THRESHOLD})</span>.
						{" "}
						Esto evita
						{" "}
						<span className="font-semibold">picos irreales</span>
						{" "}
						que distorsionen el promedio y los máximos/mínimos.
					</p>
					<p>
						Puntos graficados: <span className="font-semibold">{effectiveRateSeriesData.length}</span>
					</p>
					<p>
						Tasa promedio: <span className="font-semibold">{effectiveRateSummary.promedio === null ? "-" : `${formatNumber(effectiveRateSummary.promedio, 4)} m/h`}</span>
					</p>
					<p>
						Subida máxima: <span className="font-semibold">{effectiveRateSummary.maxSubida === null ? "-" : `${formatNumber(effectiveRateSummary.maxSubida, 4)} m/h`}</span>
					</p>
					<p>
						Bajada máxima: <span className="font-semibold">{effectiveRateSummary.maxBajada === null ? "-" : `${formatNumber(effectiveRateSummary.maxBajada, 4)} m/h`}</span>
					</p>
				</div>
			</div>
		</section>
	);
}
