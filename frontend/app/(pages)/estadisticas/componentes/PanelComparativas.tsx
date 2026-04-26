"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@componentes/components/ui/card";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@componentes/components/ui/chart";
import { type EstadisticaAtributo } from "@servicios/api/django.api";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type LimnigrafoResponse } from "types/limnigrafos";
import usePanelComparativasData from "../hooks/usePanelComparativasData";
import { type EstadisticasFilters } from "../lib/estadisticas-domain";
import {
	TIME_RANGE_LABEL,
	formatAtributoValue,
	toNumericTooltipValue,
} from "../lib/panel-comparativas-domain";

type PanelComparativasProps = {
	limnigrafos: LimnigrafoResponse[];
	limnigrafosError: unknown;
	chartAtributo: EstadisticaAtributo;
	chartLimnigrafos: string[];
	chartFilters: EstadisticasFilters;
};

export default function PanelComparativas({
	limnigrafos,
	limnigrafosError,
	chartAtributo,
	chartLimnigrafos,
	chartFilters,
}: PanelComparativasProps) {
	const {
		chartSeries,
		chartConfig,
		filteredChartData,
		loadingComparativas,
		hasChartError,
		limnigrafosSeleccionados,
		atributoSeleccionado,
	} = usePanelComparativasData({
		limnigrafos,
		chartAtributo,
		chartLimnigrafos,
		chartFilters,
	});
	const rangeDescription = chartFilters.modo === "realtime"
		? `Ventana actual: ${TIME_RANGE_LABEL[chartFilters.ventana]}. Actualización automática cada 30 segundos.`
		: "Rango actual: fechas personalizadas aplicadas.";

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
							{" "}
							{rangeDescription}
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
