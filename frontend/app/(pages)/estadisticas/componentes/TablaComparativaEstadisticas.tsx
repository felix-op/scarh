"use client";

import DataTable from "@componentes/tabla/DataTable";
import { type ColumnConfig } from "@componentes/tabla/types";
import {
	type EstadisticaAtributo,
	type EstadisticaOutputItem,
	usePostEstadistica,
} from "@servicios/api/django.api";
import { useEffect, useMemo, useRef, useState } from "react";
import { type LimnigrafoResponse } from "types/limnigrafos";

type ComparativaTableRow = {
	rowId: string;
	limnigrafo: string;
	minimo: string;
	maximo: string;
	moda: string;
	desvioEstandar: string;
	percentil90: string;
};

type TablaComparativaEstadisticasProps = {
	atributo: EstadisticaAtributo;
	desde: string;
	hasta: string;
	limnigrafosSeleccionados: string[];
	limnigrafos: LimnigrafoResponse[];
};

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

function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}
	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

function formatNullableNumber(value: number | null | undefined, decimals = 2): string {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return "-";
	}

	return formatNumber(value, decimals);
}

export default function TablaComparativaEstadisticas({
	atributo,
	desde,
	hasta,
	limnigrafosSeleccionados,
	limnigrafos,
}: TablaComparativaEstadisticasProps) {
	const [estadisticas, setEstadisticas] = useState<EstadisticaOutputItem[]>([]);
	const [estadisticasError, setEstadisticasError] = useState<string | null>(null);
	const statsRequestIdRef = useRef(0);
	const { mutateAsync: calcularEstadistica, isPending: isCalculandoEstadisticas } = usePostEstadistica();

	const limnigrafoNameById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);

	const limnigrafosIds = useMemo(
		() => limnigrafosSeleccionados
			.map((item) => Number.parseInt(item, 10))
			.filter((item) => !Number.isNaN(item)),
		[limnigrafosSeleccionados],
	);

	const desdeIso = useMemo(() => toIsoString(desde), [desde]);
	const hastaIso = useMemo(() => toIsoString(hasta), [hasta]);

	const estadisticasRequest = useMemo(() => {
		if (limnigrafosIds.length === 0 || !desdeIso || !hastaIso) {
			return null;
		}
		return {
			limnigrafos: limnigrafosIds,
			atributo,
			fecha_inicio: desdeIso,
			fecha_fin: hastaIso,
		};
	}, [atributo, desdeIso, hastaIso, limnigrafosIds]);

	const shouldShowEstadisticas = limnigrafosIds.length > 0 && Boolean(desdeIso && hastaIso);
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
				moda: formatNullableNumber(item.moda, 2),
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
				id: "moda",
				header: "Moda",
				accessorKey: "moda",
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

	useEffect(() => {
		if (!estadisticasRequest) {
			return;
		}

		let cancelled = false;
		const requestId = statsRequestIdRef.current + 1;
		statsRequestIdRef.current = requestId;

		async function run() {
			try {
				setEstadisticasError(null);
				const result = await calcularEstadistica({
					data: estadisticasRequest,
				});

				if (cancelled || statsRequestIdRef.current !== requestId) {
					return;
				}

				setEstadisticas(result);
			} catch (error) {
				if (cancelled || statsRequestIdRef.current !== requestId) {
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

		run();

		return () => {
			cancelled = true;
		};
	}, [calcularEstadistica, estadisticasRequest]);

	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
						Tabla comparativa
					</p>
					<p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
						Cálculo por rango personalizado para limnígrafos seleccionados.
					</p>
				</div>
			</div>

			{estadisticasErrorVisible ? (
				<p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
					{estadisticasErrorVisible}
				</p>
			) : null}
			{isCalculandoEstadisticas ? (
				<p className="mb-4 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-[14px] text-[#075985] dark:border-[#1E3A8A] dark:bg-[#0B2A43] dark:text-[#BFDBFE]">
					Calculando estadísticas...
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
	);
}
