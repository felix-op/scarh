"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import PaginaBase from "@componentes/base/PaginaBase";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import {
	EstadisticaAtributo,
	EstadisticaOutputItem,
	LimnigrafoPaginatedResponse,
	LimnigrafoResponse,
	MedicionPaginatedResponse,
	MedicionPostRequest,
	MedicionResponse,
	useGetLimnigrafos,
	useGetMediciones,
	usePostEstadistica,
	usePostMedicion,
} from "@servicios/api/django.api";
import ModalCargaManualMedicion, {
	ManualFormState,
} from "@componentes/mediciones/ModalCargaManualMedicion";
import ModalImportacionMediciones from "@componentes/mediciones/ModalImportacionMediciones";
import {
	buildCsvContent,
	downloadTextFile,
	formatDate,
	formatNumber,
	formatTime,
	parseImportRowsByFilename,
	parseNumeric,
	ParsedMedicionImportRow,
	toDatetimeLocalInputValue,
} from "./utils";

const PAGE_SIZE = 25;
const EXPORT_PAGE_SIZE = 1000;

const HEADER_ACTION_PRIMARY_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#CFE2F1] bg-[#DDEEFF] px-6 text-sm font-semibold text-[#258CC6] shadow-[0px_4px_10px_rgba(37,140,198,0.22)] transition hover:bg-[#CFE5FB] disabled:cursor-not-allowed disabled:opacity-70";

const HEADER_ACTION_SECONDARY_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#EFCAD5] bg-[#F7E0E8] px-6 text-sm font-semibold text-[#F05275] shadow-[0px_4px_10px_rgba(240,82,117,0.2)] transition hover:bg-[#F3D3DE] disabled:cursor-not-allowed disabled:opacity-70";

type FuenteFiltro = "" | "manual" | "automatico";

type ComparativasFilters = {
	desde: string;
	hasta: string;
	atributo: EstadisticaAtributo;
};

type HistorialFilters = {
	limnigrafo: string;
	fuente: FuenteFiltro;
	desde: string;
	hasta: string;
	busqueda: string;
};

type MedicionRow = {
	id: string;
	limnigrafo: string;
	fuente: string;
	fecha: string;
	hora: string;
	altura: string;
	presion: string;
	temperatura: string;
	bateria: string;
};

function getDefaultDateRange() {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
	};
}

function getDefaultComparativasFilters(): ComparativasFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		desde,
		hasta,
		atributo: "altura_agua",
	};
}

function getDefaultHistorialFilters(): HistorialFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		limnigrafo: "",
		fuente: "",
		desde,
		hasta,
		busqueda: "",
	};
}

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

async function fetchAllMedicionesForExport(queryParams: Record<string, string>): Promise<MedicionResponse[]> {
	let page = 1;
	const allRows: MedicionResponse[] = [];

	while (true) {
		const currentParams = new URLSearchParams({
			...queryParams,
			limit: String(EXPORT_PAGE_SIZE),
			page: String(page),
		});

		const response = await fetch(`/api/proxy/medicion/?${currentParams.toString()}`, {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			const errorBody = await response.json().catch(() => ({}));
			const errorText =
				typeof errorBody === "string"
					? errorBody
					: errorBody?.detail ?? errorBody?.error ?? "No se pudieron exportar las mediciones.";
			throw new Error(errorText);
		}

		const payload = (await response.json()) as MedicionPaginatedResponse;
		allRows.push(...(payload.results ?? []));

		if (!payload.next) {
			break;
		}

		page += 1;
	}

	return allRows;
}

function mapMedicionToRow(medicion: MedicionResponse, limnigrafoName: string): MedicionRow {
	return {
		id: String(medicion.id),
		limnigrafo: limnigrafoName,
		fuente: medicion.fuente,
		fecha: formatDate(medicion.fecha_hora),
		hora: formatTime(medicion.fecha_hora),
		altura: medicion.altura_agua !== null ? `${formatNumber(medicion.altura_agua, 2)} m` : "-",
		presion: medicion.presion !== null ? `${formatNumber(medicion.presion, 2)} hPa` : "-",
		temperatura: medicion.temperatura !== null ? `${formatNumber(medicion.temperatura, 2)} °C` : "-",
		bateria: medicion.nivel_de_bateria !== null ? `${formatNumber(medicion.nivel_de_bateria, 1)} %` : "-",
	};
}

const tableColumns: ColumnConfig<MedicionRow>[] = [
	{
		id: "limnigrafo",
		header: "Limnígrafo",
		cell: (row) => <span className="px-4 py-3 font-semibold text-[#011018]">{row.limnigrafo}</span>,
	},
	{
		id: "fuente",
		header: "Fuente",
		cell: (row) => (
			<div className="px-4 py-3">
				<span
					className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
						row.fuente === "manual"
							? "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
							: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]"
					}`}
				>
					{row.fuente === "manual" ? "Manual" : "Automático"}
				</span>
			</div>
		),
	},
	{
		id: "altura",
		header: "Altura",
		cell: (row) => <span className="px-4 py-3">{row.altura}</span>,
	},
	{
		id: "presion",
		header: "Presión",
		cell: (row) => <span className="px-4 py-3">{row.presion}</span>,
	},
	{
		id: "temperatura",
		header: "Temperatura",
		cell: (row) => <span className="px-4 py-3">{row.temperatura}</span>,
	},
	{
		id: "bateria",
		header: "Batería",
		cell: (row) => <span className="px-4 py-3">{row.bateria}</span>,
	},
	{
		id: "fechaHora",
		header: "Fecha y hora",
		cell: (row) => (
			<div className="px-4 py-3 text-[#4B4B4B]">
				<p className="leading-5">{row.fecha}</p>
				<p className="text-[13px] leading-5 text-[#64748B]">{row.hora}</p>
			</div>
		),
	},
];

export default function MedicionesPage() {
	const [comparativasFilters, setComparativasFilters] = useState<ComparativasFilters>(getDefaultComparativasFilters);
	const [appliedComparativasFilters, setAppliedComparativasFilters] = useState<ComparativasFilters>(getDefaultComparativasFilters);
	const [historialFilters, setHistorialFilters] = useState<HistorialFilters>(getDefaultHistorialFilters);
	const [appliedHistorialFilters, setAppliedHistorialFilters] = useState<HistorialFilters>(getDefaultHistorialFilters);
	const [currentPage, setCurrentPage] = useState(1);
	const [compareIds, setCompareIds] = useState<string[]>([]);
	const [compareSearch, setCompareSearch] = useState("");
	const [estadisticas, setEstadisticas] = useState<EstadisticaOutputItem[]>([]);
	const [estadisticasError, setEstadisticasError] = useState<string | null>(null);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [errorAccion, setErrorAccion] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isManualModalOpen, setIsManualModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importRows, setImportRows] = useState<ParsedMedicionImportRow[]>([]);
	const [importFileName, setImportFileName] = useState("");
	const [importFallbackLimnigrafo, setImportFallbackLimnigrafo] = useState("");
	const [manualForm, setManualForm] = useState<ManualFormState>({
		limnigrafo: "",
		fecha_hora: toDatetimeLocalInputValue(new Date()),
		altura_agua: "",
		presion: "",
		temperatura: "",
		nivel_de_bateria: "",
	});

	const {
		data: limnigrafosData,
		isLoading: isLoadingLimnigrafos,
		error: limnigrafosError,
	} = useGetLimnigrafos({
		params: {
			queryParams: {
				limit: "1000",
				page: "1",
			},
		},
	});

	const limnigrafosPayload = limnigrafosData as LimnigrafoPaginatedResponse | LimnigrafoResponse[] | undefined;
	const limnigrafos = Array.isArray(limnigrafosPayload)
		? limnigrafosPayload
		: limnigrafosPayload?.results ?? [];

	const limnigrafoNameById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);

	const filteredCompareLimnigrafos = useMemo(() => {
		const search = compareSearch.trim().toLowerCase();
		if (!search) {
			return limnigrafos;
		}

		return limnigrafos.filter((limnigrafo) => (
			`${limnigrafo.codigo} ${limnigrafo.descripcion ?? ""} ${limnigrafo.id}`
				.toLowerCase()
				.includes(search)
		));
	}, [compareSearch, limnigrafos]);

	const queryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(PAGE_SIZE),
			page: String(currentPage),
		};

		if (appliedHistorialFilters.limnigrafo) {
			params.limnigrafo = appliedHistorialFilters.limnigrafo;
		}
		if (appliedHistorialFilters.fuente) {
			params.fuente = appliedHistorialFilters.fuente;
		}

		const desdeIso = toIsoString(appliedHistorialFilters.desde);
		if (desdeIso) {
			params.desde = desdeIso;
		}

		const hastaIso = toIsoString(appliedHistorialFilters.hasta);
		if (hastaIso) {
			params.hasta = hastaIso;
		}

		return params;
	}, [appliedHistorialFilters, currentPage]);

	const {
		data: medicionesData,
		isLoading: isLoadingMediciones,
		isFetching: isFetchingMediciones,
		error: medicionesError,
		refetch: refetchMediciones,
	} = useGetMediciones({
		params: {
			queryParams,
		},
		config: {
			placeholderData: (previous) => previous,
		},
	});

	const postMedicion = usePostMedicion();
	const postEstadistica = usePostEstadistica();

	const visibleMediciones = useMemo(() => {
		const source = medicionesData?.results ?? [];
		const search = appliedHistorialFilters.busqueda.trim().toLowerCase();
		if (!search) {
			return source;
		}

		return source.filter((medicion) => {
			const limnigrafoName = (limnigrafoNameById.get(medicion.limnigrafo) ?? "").toLowerCase();
			const target = [
				String(medicion.id),
				limnigrafoName,
				medicion.fuente,
				medicion.fecha_hora,
				String(medicion.altura_agua ?? ""),
				String(medicion.presion ?? ""),
				String(medicion.temperatura ?? ""),
			].join(" ").toLowerCase();

			return target.includes(search);
		});
	}, [appliedHistorialFilters.busqueda, limnigrafoNameById, medicionesData]);

	const tableRows = useMemo(
		() =>
			visibleMediciones.map((medicion) =>
				mapMedicionToRow(
					medicion,
					limnigrafoNameById.get(medicion.limnigrafo) ?? `ID ${medicion.limnigrafo}`,
				),
			),
		[limnigrafoNameById, visibleMediciones],
	);

	const serverCount = medicionesData?.count ?? 0;
	const totalPages = Math.max(1, Math.ceil(serverCount / PAGE_SIZE));
	const startRow = serverCount === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1;
	const endRow = Math.min(currentPage * PAGE_SIZE, serverCount);

	const isLoading = isLoadingLimnigrafos || isLoadingMediciones;
	const topError = limnigrafosError ?? medicionesError;

	async function handleExport(format: "csv" | "json") {
		setErrorAccion(null);
		setMensaje(null);
		setIsExporting(true);

		try {
			const exportRows = await fetchAllMedicionesForExport(queryParams);
			if (format === "csv") {
				const csv = buildCsvContent(exportRows, limnigrafoNameById);
				downloadTextFile(`mediciones_${Date.now()}.csv`, csv, "text/csv;charset=utf-8");
			} else {
				downloadTextFile(
					`mediciones_${Date.now()}.json`,
					JSON.stringify(exportRows, null, 2),
					"application/json;charset=utf-8",
				);
			}

			setMensaje(`Exportación completada (${exportRows.length} registros).`);
		} catch (error) {
			setErrorAccion(error instanceof Error ? error.message : "No se pudo exportar la información.");
		} finally {
			setIsExporting(false);
		}
	}

	async function handleCalcularEstadisticas() {
		setEstadisticasError(null);

		const selectedIds = compareIds;

		if (selectedIds.length === 0) {
			setEstadisticas([]);
			setEstadisticasError("Seleccioná al menos un limnígrafo para calcular estadísticas.");
			return;
		}

		const desdeIso = toIsoString(appliedComparativasFilters.desde);
		const hastaIso = toIsoString(appliedComparativasFilters.hasta);

		if (!desdeIso || !hastaIso) {
			setEstadisticas([]);
			setEstadisticasError("Definí un rango de fechas válido para calcular estadísticas.");
			return;
		}

		try {
			const result = await postEstadistica.mutateAsync({
				data: {
					limnigrafos: selectedIds.map((item) => Number.parseInt(item, 10)).filter((item) => !Number.isNaN(item)),
					atributo: appliedComparativasFilters.atributo,
					fecha_inicio: desdeIso,
					fecha_fin: hastaIso,
				},
			});
			setEstadisticas(result);
		} catch (error) {
			setEstadisticas([]);
			setEstadisticasError(
				error instanceof Error
					? error.message
					: "No se pudieron calcular estadísticas para el rango seleccionado.",
			);
		}
	}

	function handleComparativasFilterChange<K extends keyof ComparativasFilters>(
		field: K,
		value: ComparativasFilters[K],
	) {
		setComparativasFilters((prev) => ({ ...prev, [field]: value }));
	}

	function handleApplyComparativasFilters() {
		setAppliedComparativasFilters(comparativasFilters);
		setMensaje(null);
		setErrorAccion(null);
	}

	function handleClearComparativasFilters() {
		const reset = getDefaultComparativasFilters();
		setComparativasFilters(reset);
		setAppliedComparativasFilters(reset);
		setCompareIds([]);
		setCompareSearch("");
		setEstadisticas([]);
		setEstadisticasError(null);
	}

	function handleHistorialFilterChange<K extends keyof HistorialFilters>(field: K, value: HistorialFilters[K]) {
		setHistorialFilters((prev) => ({ ...prev, [field]: value }));
	}

	function handleApplyHistorialFilters() {
		setAppliedHistorialFilters(historialFilters);
		setCurrentPage(1);
		setMensaje(null);
		setErrorAccion(null);
	}

	function handleClearHistorialFilters() {
		const reset = getDefaultHistorialFilters();
		setHistorialFilters(reset);
		setAppliedHistorialFilters(reset);
		setCurrentPage(1);
		setMensaje(null);
		setErrorAccion(null);
	}

	function handleManualFormChange<K extends keyof ManualFormState>(field: K, value: ManualFormState[K]) {
		setManualForm((prev) => ({ ...prev, [field]: value }));
	}

	function handleToggleCompare(limnigrafoId: string, checked: boolean) {
		setCompareIds((prev) => {
			if (checked) {
				return prev.includes(limnigrafoId) ? prev : [...prev, limnigrafoId];
			}
			return prev.filter((id) => id !== limnigrafoId);
		});
	}

	function handleSelectAllCompare() {
		setCompareIds(limnigrafos.map((limnigrafo) => String(limnigrafo.id)));
	}

	function handleSelectFilteredCompare() {
		setCompareIds((prev) => {
			const next = new Set(prev);
			filteredCompareLimnigrafos.forEach((limnigrafo) => {
				next.add(String(limnigrafo.id));
			});
			return Array.from(next);
		});
	}

	function handleClearCompareSelection() {
		setCompareIds([]);
	}

	async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorAccion(null);
		setMensaje(null);

		const limnigrafoId = Number.parseInt(
			manualForm.limnigrafo || appliedHistorialFilters.limnigrafo,
			10,
		);
		if (Number.isNaN(limnigrafoId)) {
			setErrorAccion("Seleccioná un limnígrafo para cargar la medición manual.");
			return;
		}

		const altura = parseNumeric(manualForm.altura_agua);
		if (altura === null) {
			setErrorAccion("La altura del agua es obligatoria y debe ser numérica.");
			return;
		}

		const presion = parseNumeric(manualForm.presion);
		const temperatura = parseNumeric(manualForm.temperatura);
		const bateria = parseNumeric(manualForm.nivel_de_bateria);
		if (bateria !== null && (bateria < 0 || bateria > 100)) {
			setErrorAccion("El nivel de batería debe estar entre 0 y 100.");
			return;
		}

		const fechaIso = toIsoString(manualForm.fecha_hora) ?? new Date().toISOString();

		const payload: MedicionPostRequest = {
			limnigrafo: limnigrafoId,
			fecha_hora: fechaIso,
			altura_agua: altura,
			presion,
			temperatura,
			nivel_de_bateria: bateria,
		};

		try {
			await postMedicion.mutateAsync({ data: payload });
			await refetchMediciones();
			setMensaje("Medición manual registrada correctamente.");
			setIsManualModalOpen(false);
			setManualForm((prev) => ({
				...prev,
				altura_agua: "",
				presion: "",
				temperatura: "",
				nivel_de_bateria: "",
				fecha_hora: toDatetimeLocalInputValue(new Date()),
			}));
		} catch (error) {
			setErrorAccion(error instanceof Error ? error.message : "No se pudo registrar la medición manual.");
		}
	}

	async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
		setErrorAccion(null);
		setMensaje(null);

		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		try {
			const text = await file.text();
			const rows = parseImportRowsByFilename(text, file.name);
			if (rows.length === 0) {
				setImportRows([]);
				setImportFileName("");
				setErrorAccion("No se encontraron filas válidas en el archivo.");
				return;
			}

			setImportRows(rows);
			setImportFileName(file.name);
			setMensaje(`Archivo cargado: ${rows.length} filas listas para importar.`);
		} catch (error) {
			setImportRows([]);
			setImportFileName("");
			setErrorAccion(error instanceof Error ? error.message : "No se pudo procesar el archivo seleccionado.");
		} finally {
			event.target.value = "";
		}
	}

	async function handleImportSubmit() {
		if (importRows.length === 0) {
			setErrorAccion("Cargá un archivo con mediciones antes de importar.");
			return;
		}

		const fallbackLimnigrafoId = Number.parseInt(
			importFallbackLimnigrafo
				|| appliedHistorialFilters.limnigrafo
				|| manualForm.limnigrafo,
			10,
		);
		setIsImporting(true);
		setErrorAccion(null);
		setMensaje(null);

		let successCount = 0;
		const importErrors: string[] = [];

		for (let index = 0; index < importRows.length; index += 1) {
			const row = importRows[index];
			const limnigrafoId = row.limnigrafo ?? fallbackLimnigrafoId;

			if (!limnigrafoId || Number.isNaN(limnigrafoId)) {
				importErrors.push(`Fila ${index + 1}: falta limnígrafo válido.`);
				continue;
			}

			const payload: MedicionPostRequest = {
				limnigrafo: limnigrafoId,
				fecha_hora: row.fecha_hora,
				altura_agua: row.altura_agua,
				presion: row.presion,
				temperatura: row.temperatura,
				nivel_de_bateria: row.nivel_de_bateria,
			};

			try {
				await postMedicion.mutateAsync({ data: payload });
				successCount += 1;
			} catch (error) {
				const message = error instanceof Error ? error.message : "Error desconocido";
				importErrors.push(`Fila ${index + 1}: ${message}`);
			}
		}

		setIsImporting(false);
		await refetchMediciones();

		if (successCount > 0) {
			setMensaje(`Importación finalizada. Filas guardadas: ${successCount}.`);
		}

		if (importErrors.length > 0) {
			setErrorAccion(importErrors.slice(0, 4).join(" "));
		}

		if (successCount > 0 && importErrors.length === 0) {
			setImportRows([]);
			setImportFileName("");
			setIsImportModalOpen(false);
		}
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex flex-col gap-1">
							<h1 className="text-[34px] font-semibold text-[#011018]">Mediciones</h1>
							<p className="text-base text-[#4D5562]">
								Gestión operativa de mediciones históricas, análisis, comparación, exportación e importación.
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3 lg:justify-end">
							<button
								type="button"
								onClick={() => setIsManualModalOpen(true)}
								className={HEADER_ACTION_PRIMARY_BUTTON_CLASS}
							>
								<span className="icon-[mdi--pencil] text-base" aria-hidden="true" />
								<span>Carga manual</span>
							</button>
							<button
								type="button"
								onClick={() => setIsImportModalOpen(true)}
								className={HEADER_ACTION_SECONDARY_BUTTON_CLASS}
							>
								<span className="icon-[mdi--upload] text-base" aria-hidden="true" />
								<span>Importación</span>
							</button>
						</div>
					</header>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Comparativas</p>
								</div>
								<button
									type="button"
									onClick={handleCalcularEstadisticas}
									disabled={postEstadistica.isPending}
									className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50"
								>
									{postEstadistica.isPending ? "Calculando..." : "Calcular estadísticas"}
								</button>
							</div>

							<div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
										Desde
										<input
											type="datetime-local"
											value={comparativasFilters.desde}
											onChange={(event) => handleComparativasFilterChange("desde", event.target.value)}
											className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
										/>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
										Hasta
										<input
											type="datetime-local"
											value={comparativasFilters.hasta}
											onChange={(event) => handleComparativasFilterChange("hasta", event.target.value)}
											className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
										/>
									</label>

									<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
										Atributo
										<select
											value={comparativasFilters.atributo}
											onChange={(event) => handleComparativasFilterChange("atributo", event.target.value as EstadisticaAtributo)}
											className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
										>
											<option value="altura_agua">Altura del agua</option>
											<option value="presion">Presión</option>
											<option value="temperatura">Temperatura</option>
										</select>
									</label>
								</div>

								<div className="mt-4 flex flex-wrap gap-3">
									<button
										type="button"
										onClick={handleApplyComparativasFilters}
										className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)]"
									>
										Aplicar filtros de comparativas
									</button>
									<button
										type="button"
										onClick={handleClearComparativasFilters}
										className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155]"
									>
										Limpiar
									</button>
								</div>
							</div>

							<div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
									<div className="flex w-full max-w-xl flex-col gap-1">
										<label htmlFor="compare-search" className="text-[13px] font-semibold text-[#475569]">
											Buscar limnígrafo
										</label>
										<input
											id="compare-search"
											type="text"
											value={compareSearch}
											onChange={(event) => setCompareSearch(event.target.value)}
											placeholder="Buscar ..."
											className="rounded-xl border border-[#D3D4D5] bg-white px-3 py-2 text-[14px] text-[#334155] outline-none focus:border-[#0982C8]"
										/>
									</div>

									<div className="flex flex-wrap gap-2">
										<button
											type="button"
											onClick={handleSelectAllCompare}
											disabled={limnigrafos.length === 0}
											className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[13px] font-semibold text-[#1D4ED8] disabled:opacity-50"
										>
											Seleccionar todos
										</button>
										<button
											type="button"
											onClick={handleSelectFilteredCompare}
											disabled={filteredCompareLimnigrafos.length === 0}
											className="rounded-lg border border-[#BAE6FD] bg-[#ECFEFF] px-3 py-2 text-[13px] font-semibold text-[#0369A1] disabled:opacity-50"
										>
											Seleccionar visibles
										</button>
										<button
											type="button"
											onClick={handleClearCompareSelection}
											disabled={compareIds.length === 0}
											className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-semibold text-[#475569] disabled:opacity-50"
										>
											Limpiar selección
										</button>
									</div>
								</div>

								<p className="mt-3 text-[13px] text-[#64748B]">
									Seleccionados: {compareIds.length} de {limnigrafos.length}
									{compareSearch.trim() ? ` • Visibles: ${filteredCompareLimnigrafos.length}` : ""}
								</p>

								<div className="mt-3 max-h-[220px] overflow-auto rounded-xl border border-[#E2E8F0] bg-white p-2">
									{filteredCompareLimnigrafos.length === 0 ? (
										<p className="px-2 py-3 text-[13px] text-[#64748B]">No hay limnígrafos para ese filtro.</p>
									) : (
										<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
											{filteredCompareLimnigrafos.map((limnigrafo) => {
												const isChecked = compareIds.includes(String(limnigrafo.id));
												return (
													<label key={limnigrafo.id} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[14px] text-[#334155]">
														<input
															type="checkbox"
															checked={isChecked}
															onChange={(event) => handleToggleCompare(String(limnigrafo.id), event.target.checked)}
														/>
														<span className="font-medium">{limnigrafo.codigo}</span>
													</label>
												);
											})}
										</div>
									)}
								</div>
							</div>

							{estadisticasError ? (
								<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
									{estadisticasError}
								</p>
							) : null}

							<div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
								<table className="min-w-full text-left text-[14px] text-[#334155]">
									<thead className="bg-[#F8FAFC] text-[12px] uppercase tracking-wide text-[#64748B]">
										<tr>
											<th className="px-4 py-3">Limnígrafo</th>
											<th className="px-4 py-3">Mínimo</th>
											<th className="px-4 py-3">Máximo</th>
											<th className="px-4 py-3">Desv. estándar</th>
											<th className="px-4 py-3">Percentil 90</th>
										</tr>
									</thead>
									<tbody>
										{estadisticas.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-4 py-5 text-center text-[#64748B]">
													Sin datos comparativos calculados.
												</td>
											</tr>
										) : (
											estadisticas.map((item, index) => (
												<tr key={`estadistica-${item.id ?? "global"}-${index}`} className="border-t border-[#E2E8F0]">
													<td className="px-4 py-3 font-semibold text-[#0F172A]">
														{item.id === null ? "Global" : (limnigrafoNameById.get(item.id) ?? `ID ${item.id}`)}
													</td>
													<td className="px-4 py-3">{formatNumber(item.minimo, 2)}</td>
													<td className="px-4 py-3">{formatNumber(item.maximo, 2)}</td>
													<td className="px-4 py-3">{formatNumber(item.desvio_estandar, 2)}</td>
													<td className="px-4 py-3">{formatNumber(item.percentil_90, 2)}</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Historial completo</p>
							<span className="rounded-full bg-[#F1F5F9] px-4 py-1 text-[13px] font-semibold text-[#475569]">
								{isLoading ? "Cargando..." : `${serverCount} registros`}
							</span>
						</div>

						<div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
								<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
									Limnígrafo
									<select
										value={historialFilters.limnigrafo}
										onChange={(event) => handleHistorialFilterChange("limnigrafo", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									>
										<option value="">Todos</option>
										{limnigrafos.map((limnigrafo) => (
											<option key={limnigrafo.id} value={String(limnigrafo.id)}>
												{limnigrafo.codigo}
											</option>
										))}
									</select>
								</label>

								<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
									Fuente
									<select
										value={historialFilters.fuente}
										onChange={(event) => handleHistorialFilterChange("fuente", event.target.value as FuenteFiltro)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									>
										<option value="">Todas</option>
										<option value="manual">Manual</option>
										<option value="automatico">Automática</option>
									</select>
								</label>

								<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
									Desde
									<input
										type="datetime-local"
										value={historialFilters.desde}
										onChange={(event) => handleHistorialFilterChange("desde", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
									Hasta
									<input
										type="datetime-local"
										value={historialFilters.hasta}
										onChange={(event) => handleHistorialFilterChange("hasta", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
									Buscar
									<input
										type="text"
										value={historialFilters.busqueda}
										onChange={(event) => handleHistorialFilterChange("busqueda", event.target.value)}
										placeholder="ID, limnígrafo o valor"
										className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>
							</div>

							<div className="mt-4 flex flex-wrap gap-3">
								<button
									type="button"
									onClick={handleApplyHistorialFilters}
									className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)]"
								>
									Aplicar filtros de historial
								</button>
								<button
									type="button"
									onClick={handleClearHistorialFilters}
									className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155]"
								>
									Limpiar
								</button>
								<button
									type="button"
									onClick={() => handleExport("csv")}
									disabled={isExporting}
									className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50"
								>
									Exportar CSV
								</button>
								<button
									type="button"
									onClick={() => handleExport("json")}
									disabled={isExporting}
									className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50"
								>
									Exportar JSON
								</button>
							</div>
						</div>

						{topError ? (
							<p className="mb-4 mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
								No se pudieron cargar las mediciones. Verificá la conexión con el backend.
							</p>
						) : null}

						<DataTable
							data={tableRows}
							columns={tableColumns}
							rowIdKey="id"
							showTopBar={false}
							enableRowAnimation={false}
							loadingRows={8}
							isLoading={isLoading}
							emptyStateContent={<span className="text-[#6B7280]">No hay mediciones para los filtros seleccionados.</span>}
							styles={{
								cardClassName: "rounded-[20px] border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)]",
								scrollerClassName: "overflow-x-auto",
								tableClassName: "min-w-full text-left text-[14px] text-[#2F2F2F]",
								theadClassName: "bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B] border-none",
								headerCellClassName: "px-4 py-3",
								tbodyClassName: "divide-y divide-[#EAEAEA]",
								rowClassName: "border-0 hover:bg-[#F9FBFF]",
								cellClassName: "align-middle",
								emptyCellClassName: "px-4 py-8",
							}}
						/>

						<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
							<p className="text-[13px] text-[#64748B]">
								Mostrando {startRow}-{endRow} de {serverCount}. Página {currentPage} de {totalPages}
								{appliedHistorialFilters.busqueda ? ` (coincidencias en página: ${tableRows.length})` : ""}
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage <= 1 || isFetchingMediciones}
									className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40"
								>
									Anterior
								</button>
								<button
									type="button"
									onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
									disabled={currentPage >= totalPages || isFetchingMediciones}
									className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40"
								>
									Siguiente
								</button>
							</div>
						</div>
					</section>

					<ModalCargaManualMedicion
						open={isManualModalOpen}
						onOpenChange={setIsManualModalOpen}
						manualForm={manualForm}
						limnigrafos={limnigrafos}
						isSubmitting={postMedicion.isPending}
						onManualFormChange={handleManualFormChange}
						onSubmit={handleManualSubmit}
					/>

					<ModalImportacionMediciones
						open={isImportModalOpen}
						onOpenChange={setIsImportModalOpen}
						limnigrafos={limnigrafos}
						importFallbackLimnigrafo={importFallbackLimnigrafo}
						onImportFallbackChange={setImportFallbackLimnigrafo}
						importFileName={importFileName}
						importRows={importRows}
						isImporting={isImporting}
						onFileChange={handleImportFileChange}
						onImportSubmit={handleImportSubmit}
					/>

					{errorAccion ? (
						<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">{errorAccion}</p>
					) : null}
					{mensaje ? (
						<p className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] text-[#166534]">{mensaje}</p>
					) : null}
				</div>
			</main>
		</PaginaBase>
	);
}
