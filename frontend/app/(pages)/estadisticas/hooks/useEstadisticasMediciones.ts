"use client";

import { type MedicionResponse } from "@servicios/api/django.api";
import { useEffect, useMemo, useState } from "react";
import {
	type ActiveRange,
	type EstadisticasFilters,
	type ParsedMedicion,
	REALTIME_REFRESH_MS,
	fetchAllMedicionesForStats,
	resolveCurrentRange,
} from "../lib/estadisticas-domain";

type UseEstadisticasMedicionesOutput = {
	isLoadingData: boolean;
	fetchError: string | null;
	lastUpdatedAt: string | null;
	activeRange: ActiveRange | null;
	parsedMediciones: ParsedMedicion[];
	currentRows: ParsedMedicion[];
	previousRows: ParsedMedicion[];
};

export default function useEstadisticasMediciones(appliedFilters: EstadisticasFilters): UseEstadisticasMedicionesOutput {
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
	const [rawMediciones, setRawMediciones] = useState<MedicionResponse[]>([]);
	const [activeRange, setActiveRange] = useState<ActiveRange | null>(null);
	const [refreshTick, setRefreshTick] = useState(0);

	useEffect(() => {
		if (appliedFilters.modo !== "realtime") {
			return;
		}

		const intervalId = window.setInterval(() => {
			setRefreshTick((previous) => previous + 1);
		}, REALTIME_REFRESH_MS);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [appliedFilters.modo, appliedFilters.ventana]);

	useEffect(() => {
		let cancelled = false;

		async function loadMediciones() {
			setIsLoadingData(true);
			setFetchError(null);

			const now = new Date();
			const initialCurrentRange = resolveCurrentRange(appliedFilters, now);
			const initialDurationMs = Math.max(60 * 1000, initialCurrentRange.to.getTime() - initialCurrentRange.from.getTime());
			const effectiveCurrentRange = initialCurrentRange;
			const effectivePreviousRange = {
				from: new Date(initialCurrentRange.from.getTime() - initialDurationMs),
				to: new Date(initialCurrentRange.from),
			};

			try {
				const rows = await fetchAllMedicionesForStats({
					fecha_desde: effectivePreviousRange.from.toISOString(),
					fecha_hasta: effectiveCurrentRange.to.toISOString(),
				});

				const boundedRows = rows.filter((item) => {
					const timestamp = new Date(item.fecha_hora).getTime();
					if (Number.isNaN(timestamp)) {
						return false;
					}

					return timestamp >= effectivePreviousRange.from.getTime()
						&& timestamp <= effectiveCurrentRange.to.getTime();
				});

				if (cancelled) {
					return;
				}

				setRawMediciones(boundedRows);
				setActiveRange({
					currentFrom: effectiveCurrentRange.from.getTime(),
					currentTo: effectiveCurrentRange.to.getTime(),
					previousFrom: effectivePreviousRange.from.getTime(),
					previousTo: effectivePreviousRange.to.getTime(),
				});
				setLastUpdatedAt(new Date().toISOString());
			} catch (error) {
				if (cancelled) {
					return;
				}

				setRawMediciones([]);
				setActiveRange({
					currentFrom: effectiveCurrentRange.from.getTime(),
					currentTo: effectiveCurrentRange.to.getTime(),
					previousFrom: effectivePreviousRange.from.getTime(),
					previousTo: effectivePreviousRange.to.getTime(),
				});
				setFetchError(error instanceof Error ? error.message : "No se pudieron cargar las mediciones para estadísticas.");
			} finally {
				if (!cancelled) {
					setIsLoadingData(false);
				}
			}
		}

		loadMediciones();

		return () => {
			cancelled = true;
		};
	}, [appliedFilters, refreshTick]);

	const parsedMediciones = useMemo<ParsedMedicion[]>(() => {
		return rawMediciones
			.map((medicion) => {
				const timestamp = new Date(medicion.fecha_hora).getTime();
				if (Number.isNaN(timestamp)) {
					return null;
				}
				return {
					...medicion,
					timestamp,
				};
			})
			.filter((item): item is ParsedMedicion => item !== null)
			.sort((a, b) => a.timestamp - b.timestamp);
	}, [rawMediciones]);

	const selectedLimnigrafoIds = useMemo(
		() => appliedFilters.limnigrafos
			.map((value) => Number.parseInt(value, 10))
			.filter((value) => !Number.isNaN(value)),
		[appliedFilters.limnigrafos],
	);

	const selectedLimnigrafoIdSet = useMemo(
		() => new Set(selectedLimnigrafoIds),
		[selectedLimnigrafoIds],
	);

	const currentRows = useMemo(() => {
		if (!activeRange) {
			return [] as ParsedMedicion[];
		}

		return parsedMediciones.filter((medicion) => {
			const inCurrentRange = medicion.timestamp >= activeRange.currentFrom && medicion.timestamp <= activeRange.currentTo;
			const inSelectedLimnigrafo = selectedLimnigrafoIdSet.size === 0 || selectedLimnigrafoIdSet.has(medicion.limnigrafo);
			return inCurrentRange && inSelectedLimnigrafo;
		});
	}, [activeRange, parsedMediciones, selectedLimnigrafoIdSet]);

	const previousRows = useMemo(() => {
		if (!activeRange) {
			return [] as ParsedMedicion[];
		}

		return parsedMediciones.filter((medicion) => {
			const inPreviousRange = medicion.timestamp >= activeRange.previousFrom && medicion.timestamp < activeRange.previousTo;
			const inSelectedLimnigrafo = selectedLimnigrafoIdSet.size === 0 || selectedLimnigrafoIdSet.has(medicion.limnigrafo);
			return inPreviousRange && inSelectedLimnigrafo;
		});
	}, [activeRange, parsedMediciones, selectedLimnigrafoIdSet]);

	return {
		isLoadingData,
		fetchError,
		lastUpdatedAt,
		activeRange,
		parsedMediciones,
		currentRows,
		previousRows,
	};
}
