"use client";

import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import { Cell, Label, Pie, PieChart } from "recharts";

const CHART_COLORS = {
	automatico: "#22C55E",
	manual: "#F97316",
	importCsv: "#8B5CF6",
	importJson: "#0EA5E9",
};

const fuenteChartConfig: ChartConfig = {
	automatico: { label: "Automático", color: CHART_COLORS.automatico },
	manual: { label: "Manual", color: CHART_COLORS.manual },
	import_csv: { label: "Importación CSV", color: CHART_COLORS.importCsv },
	import_json: { label: "Importación JSON", color: CHART_COLORS.importJson },
};

export type FuenteChartDatum = {
	key: "automatico" | "manual" | "import_csv" | "import_json";
	label: string;
	value: number;
	fill: string;
};

export type FuenteStats = {
	automatico: number;
	manual: number;
	importCsv: number;
	importJson: number;
	total: number;
	automaticoPct: number;
	manualPct: number;
	importCsvPct: number;
	importJsonPct: number;
};

type TarjetaCalidadOperativaCargaProps = {
	fuenteStats: FuenteStats;
	fuenteChartData: FuenteChartDatum[];
};

export default function TarjetaCalidadOperativaCarga({
	fuenteStats,
	fuenteChartData,
}: TarjetaCalidadOperativaCargaProps) {
	return (
		<section className="grid gap-6 lg:grid-cols-1">
			<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
				<div className="mb-4">
					<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
						Calidad operativa de carga
					</p>
					<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
						Distribución de registros por fuente (automática, manual e importaciones CSV/JSON) en el período actual.
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
								innerRadius={62}
								outerRadius={92}
								strokeWidth={4}
								paddingAngle={2}
							>
								{fuenteChartData.map((entry) => (
									<Cell key={entry.key} fill={entry.fill} />
								))}
								<Label
									content={({ viewBox }) => {
										if (viewBox && "cx" in viewBox && "cy" in viewBox) {
											return (
												<text
													x={viewBox.cx}
													y={viewBox.cy}
													textAnchor="middle"
													dominantBaseline="middle"
												>
													<tspan
														x={viewBox.cx}
														y={viewBox.cy}
														className="fill-[#0F172A] text-2xl font-bold dark:fill-[#E2E8F0]"
													>
														{fuenteStats.total.toLocaleString("es-AR")}
													</tspan>
													<tspan
														x={viewBox.cx}
														y={(viewBox.cy || 0) + 20}
														className="fill-[#64748B] text-[12px] dark:fill-[#94A3B8]"
													>
														Total
													</tspan>
												</text>
											);
										}
										return null;
									}}
								/>
							</Pie>
							<ChartTooltip
								cursor={false}
								content={(
									<ChartTooltipContent
										indicator="dot"
										formatter={(value, name) => {
											const numeric = typeof value === "number" ? value : Number(value);
											const label = String(name);
											return (
												<div className="flex w-full items-center justify-between gap-3">
													<span className="text-muted-foreground">{label}</span>
													<span className="font-mono font-medium text-foreground tabular-nums">
														{Number.isFinite(numeric) ? numeric.toLocaleString("es-AR") : "-"}
													</span>
												</div>
											);
										}}
									/>
								)}
							/>
							<ChartLegend content={<ChartLegendContent nameKey="key" />} />
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
						Importación CSV: <span className="font-semibold">{fuenteStats.importCsv}</span> ({fuenteStats.importCsvPct.toFixed(2)} %)
					</p>
					<p>
						Importación JSON: <span className="font-semibold">{fuenteStats.importJson}</span> ({fuenteStats.importJsonPct.toFixed(2)} %)
					</p>
					<p>
						Total de eventos: <span className="font-semibold">{fuenteStats.total}</span>
					</p>
				</div>
			</div>
		</section>
	);
}
