"use client";

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
};

export default function TarjetaTasaCambioNivel({
	activeDurationMs,
	rawRatePointsCount,
	discardedRatePoints,
	rateSeriesData,
	rateSummary,
}: TarjetaTasaCambioNivelProps) {
	return (
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
						Intervalos usados para calcular la tasa: <span className="font-semibold">{rawRatePointsCount}</span>
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
	);
}
