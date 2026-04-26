"use client";

import { type ChartConfig } from "@componentes/components/ui/chart";
import {
	type EstadisticaAtributo,
	type MedicionPaginatedResponse,
	useGetMediciones,
} from "@servicios/api/django.api";
import { useMemo } from "react";
import { type LimnigrafoResponse } from "types/limnigrafos";
import {
	type EstadisticasFilters,
	resolveCurrentRange,
} from "../lib/estadisticas-domain";
import {
	type ChartPoint,
	type ChartSerie,
	ATRIBUTO_METADATA,
	CHART_PAGE_SIZE,
	MAX_CHART_POINTS,
	PANEL_CHART_COLORS,
	getMedicionValueByAtributo,
} from "../lib/panel-comparativas-domain";

type UsePanelComparativasDataInput = {
	limnigrafos: LimnigrafoResponse[];
	chartAtributo: EstadisticaAtributo;
	chartLimnigrafos: string[];
	chartFilters: EstadisticasFilters;
};

type UsePanelComparativasDataOutput = {
	chartSeries: ChartSerie[];
	chartConfig: ChartConfig;
	filteredChartData: ChartPoint[];
	loadingComparativas: boolean;
	hasChartError: boolean;
	limnigrafosSeleccionados: number[];
	atributoSeleccionado: { label: string; unit: string; decimals: number };
};

export default function usePanelComparativasData({
	limnigrafos,
	chartAtributo,
	chartLimnigrafos,
	chartFilters,
}: UsePanelComparativasDataInput): UsePanelComparativasDataOutput {
	const activeChartRange = useMemo(
		() => resolveCurrentRange(chartFilters, new Date()),
		[chartFilters],
	);

	const comparativasQueryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(CHART_PAGE_SIZE),
			page: "1",
			fecha_desde: activeChartRange.from.toISOString(),
		};

		if (chartFilters.modo === "rango") {
			params.fecha_hasta = activeChartRange.to.toISOString();
		}

		return params;
	}, [activeChartRange, chartFilters.modo]);

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
		() => {
			const selectedIds = chartLimnigrafos
				.map((item) => Number.parseInt(item, 10))
				.filter((item) => !Number.isNaN(item));

			return selectedIds.length > 0
				? selectedIds
				: limnigrafos.map((limnigrafo) => limnigrafo.id);
		},
		[chartLimnigrafos, limnigrafos],
	);

	const chartSeries = useMemo<ChartSerie[]>(() => {
		return limnigrafosSeleccionados
			.map((parsedId, index) => {
				return {
					limnigrafoId: parsedId,
					dataKey: `limnigrafo_${parsedId}`,
					label: limnigrafoNameById.get(parsedId) ?? `ID ${parsedId}`,
					color: PANEL_CHART_COLORS[index % PANEL_CHART_COLORS.length],
				};
			})
			.filter((item): item is ChartSerie => item !== null);
	}, [limnigrafoNameById, limnigrafosSeleccionados]);

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

		return chartData.filter((point) => {
			const date = new Date(point.date);
			return date >= activeChartRange.from && date <= activeChartRange.to;
		});
	}, [activeChartRange, chartData]);

	return {
		chartSeries,
		chartConfig,
		filteredChartData,
		loadingComparativas,
		hasChartError: Boolean(medicionesComparativasError),
		limnigrafosSeleccionados,
		atributoSeleccionado: ATRIBUTO_METADATA[chartAtributo],
	};
}
