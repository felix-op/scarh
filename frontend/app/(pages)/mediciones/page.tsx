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
import MedicionLineChart from "./componentes/MedicionLineChart";
import {
	buildCsvContent,
	buildSerie,
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

const ATTRIBUTE_LABELS: Record<EstadisticaAtributo, string> = {
	altura_agua: "Altura del agua",
	presion: "Presión",
	temperatura: "Temperatura",
};

const ATTRIBUTE_UNITS: Record<EstadisticaAtributo, string> = {
	altura_agua: "m",
	presion: "hPa",
	temperatura: "°C",
};

type FuenteFiltro = "" | "manual" | "automatico";

type MedicionesFilters = {
	limnigrafo: string;
	fuente: FuenteFiltro;
	desde: string;
	hasta: string;
	busqueda: string;
	atributo: EstadisticaAtributo;
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

type ManualFormState = {
	limnigrafo: string;
	fecha_hora: string;
	altura_agua: string;
	presion: string;
	temperatura: string;
	nivel_de_bateria: string;
};

function getDefaultFilters(): MedicionesFilters {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		limnigrafo: "",
		fuente: "",
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
		busqueda: "",
		atributo: "altura_agua",
	};
}

function getAtributoValue(medicion: MedicionResponse, atributo: EstadisticaAtributo): number | null {
	switch (atributo) {
		case "altura_agua":
			return medicion.altura_agua;
		case "presion":
			return medicion.presion;
		case "temperatura":
			return medicion.temperatura;
		default:
			return null;
	}
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
	const [filters, setFilters] = useState<MedicionesFilters>(getDefaultFilters);
	const [appliedFilters, setAppliedFilters] = useState<MedicionesFilters>(getDefaultFilters);
	const [currentPage, setCurrentPage] = useState(1);
	const [compareIds, setCompareIds] = useState<string[]>([]);
	const [estadisticas, setEstadisticas] = useState<EstadisticaOutputItem[]>([]);
	const [estadisticasError, setEstadisticasError] = useState<string | null>(null);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [errorAccion, setErrorAccion] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [importRows, setImportRows] = useState<ParsedMedicionImportRow[]>([]);
	const [importFileName, setImportFileName] = useState("");
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

	const queryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(PAGE_SIZE),
			page: String(currentPage),
		};

		if (appliedFilters.limnigrafo) {
			params.limnigrafo = appliedFilters.limnigrafo;
		}
		if (appliedFilters.fuente) {
			params.fuente = appliedFilters.fuente;
		}

		const desdeIso = toIsoString(appliedFilters.desde);
		if (desdeIso) {
			params.desde = desdeIso;
		}

		const hastaIso = toIsoString(appliedFilters.hasta);
		if (hastaIso) {
			params.hasta = hastaIso;
		}

		return params;
	}, [appliedFilters, currentPage]);

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
		const search = appliedFilters.busqueda.trim().toLowerCase();
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
	}, [appliedFilters.busqueda, limnigrafoNameById, medicionesData]);

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

	const statsValues = useMemo(() => {
		const values = visibleMediciones
			.map((medicion) => getAtributoValue(medicion, appliedFilters.atributo))
			.filter((value): value is number => value !== null && Number.isFinite(value));

		if (values.length === 0) {
			return {
				promedio: null,
				minimo: null,
				maximo: null,
				ultima: null,
			};
		}

		const suma = values.reduce((acc, value) => acc + value, 0);
		return {
			promedio: suma / values.length,
			minimo: Math.min(...values),
			maximo: Math.max(...values),
			ultima: values[values.length - 1],
		};
	}, [appliedFilters.atributo, visibleMediciones]);

	const serie = useMemo(
		() =>
			buildSerie(visibleMediciones, (medicion) => getAtributoValue(medicion, appliedFilters.atributo), 30),
		[appliedFilters.atributo, visibleMediciones],
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

		const selectedIds = compareIds.length > 0
			? compareIds
			: appliedFilters.limnigrafo
				? [appliedFilters.limnigrafo]
				: [];

		if (selectedIds.length === 0) {
			setEstadisticas([]);
			setEstadisticasError("Seleccioná al menos un limnígrafo para calcular estadísticas.");
			return;
		}

		const desdeIso = toIsoString(appliedFilters.desde);
		const hastaIso = toIsoString(appliedFilters.hasta);

		if (!desdeIso || !hastaIso) {
			setEstadisticas([]);
			setEstadisticasError("Definí un rango de fechas válido para calcular estadísticas.");
			return;
		}

		try {
			const result = await postEstadistica.mutateAsync({
				data: {
					limnigrafos: selectedIds.map((item) => Number.parseInt(item, 10)).filter((item) => !Number.isNaN(item)),
					atributo: appliedFilters.atributo,
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

	function handleFilterChange<K extends keyof MedicionesFilters>(field: K, value: MedicionesFilters[K]) {
		setFilters((prev) => ({ ...prev, [field]: value }));
	}

	function handleApplyFilters() {
		setAppliedFilters(filters);
		setCurrentPage(1);
		setMensaje(null);
		setErrorAccion(null);
	}

	function handleClearFilters() {
		const reset = getDefaultFilters();
		setFilters(reset);
		setAppliedFilters(reset);
		setCurrentPage(1);
		setCompareIds([]);
		setEstadisticas([]);
		setEstadisticasError(null);
	}

	function handleManualFormChange<K extends keyof ManualFormState>(field: K, value: ManualFormState[K]) {
		setManualForm((prev) => ({ ...prev, [field]: value }));
	}

	async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorAccion(null);
		setMensaje(null);

		const limnigrafoId = Number.parseInt(manualForm.limnigrafo || appliedFilters.limnigrafo, 10);
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

		const fallbackLimnigrafoId = Number.parseInt(appliedFilters.limnigrafo || manualForm.limnigrafo, 10);
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
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018]">Mediciones</h1>
						<p className="text-base text-[#4D5562]">
							Gestión operativa de mediciones históricas, análisis, comparación, exportación e importación.
						</p>
					</header>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
							<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
								Limnígrafo
								<select
									value={filters.limnigrafo}
									onChange={(event) => handleFilterChange("limnigrafo", event.target.value)}
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
									value={filters.fuente}
									onChange={(event) => handleFilterChange("fuente", event.target.value as FuenteFiltro)}
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
									value={filters.desde}
									onChange={(event) => handleFilterChange("desde", event.target.value)}
									className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
								/>
							</label>

							<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
								Hasta
								<input
									type="datetime-local"
									value={filters.hasta}
									onChange={(event) => handleFilterChange("hasta", event.target.value)}
									className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
								/>
							</label>

							<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
								Buscar
								<input
									type="text"
									value={filters.busqueda}
									onChange={(event) => handleFilterChange("busqueda", event.target.value)}
									placeholder="ID, limnígrafo o valor"
									className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
								/>
							</label>

							<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
								Atributo
								<select
									value={filters.atributo}
									onChange={(event) => handleFilterChange("atributo", event.target.value as EstadisticaAtributo)}
									className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
								>
									<option value="altura_agua">Altura del agua</option>
									<option value="presion">Presión</option>
									<option value="temperatura">Temperatura</option>
								</select>
							</label>
						</div>

						<div className="mt-5 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={handleApplyFilters}
								className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)]"
							>
								Aplicar filtros
							</button>
							<button
								type="button"
								onClick={handleClearFilters}
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
					</section>

					<section className="grid gap-6 lg:grid-cols-4">
						<div className="rounded-[24px] bg-white p-5 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Total</p>
							<p className="mt-2 text-[30px] font-semibold text-[#011018]">{serverCount}</p>
							<p className="text-[13px] text-[#64748B]">Registros en el historial</p>
						</div>
						<div className="rounded-[24px] bg-white p-5 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Promedio</p>
							<p className="mt-2 text-[30px] font-semibold text-[#011018]">
								{statsValues.promedio === null ? "-" : `${formatNumber(statsValues.promedio, 2)} ${ATTRIBUTE_UNITS[appliedFilters.atributo]}`}
							</p>
							<p className="text-[13px] text-[#64748B]">{ATTRIBUTE_LABELS[appliedFilters.atributo]}</p>
						</div>
						<div className="rounded-[24px] bg-white p-5 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Mínimo</p>
							<p className="mt-2 text-[30px] font-semibold text-[#011018]">
								{statsValues.minimo === null ? "-" : `${formatNumber(statsValues.minimo, 2)} ${ATTRIBUTE_UNITS[appliedFilters.atributo]}`}
							</p>
							<p className="text-[13px] text-[#64748B]">Valor mínimo del rango</p>
						</div>
						<div className="rounded-[24px] bg-white p-5 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">Máximo</p>
							<p className="mt-2 text-[30px] font-semibold text-[#011018]">
								{statsValues.maximo === null ? "-" : `${formatNumber(statsValues.maximo, 2)} ${ATTRIBUTE_UNITS[appliedFilters.atributo]}`}
							</p>
							<p className="text-[13px] text-[#64748B]">Valor máximo del rango</p>
						</div>
					</section>

					<MedicionLineChart
						title="Serie temporal"
						subtitle={`Últimos puntos de ${ATTRIBUTE_LABELS[appliedFilters.atributo].toLowerCase()}`}
						data={serie}
					/>

					<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
						<div className="flex flex-col gap-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Comparación</p>
									<p className="text-[14px] text-[#64748B]">Seleccioná limnígrafos y calculá estadísticas comparativas.</p>
								</div>
								<button
									type="button"
									onClick={handleCalcularEstadisticas}
									disabled={postEstadistica.isPending}
									className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50"
								>
									{postEstadistica.isPending ? "Calculando..." : "Calcular estadísticas"}
								</button>
							</div>

							<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
								{limnigrafos.map((limnigrafo) => {
									const isChecked = compareIds.includes(String(limnigrafo.id));
									return (
										<label key={limnigrafo.id} className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-[14px] text-[#334155]">
											<input
												type="checkbox"
												checked={isChecked}
												onChange={(event) => {
													setCompareIds((prev) => {
														if (event.target.checked) {
															return [...prev, String(limnigrafo.id)];
														}
														return prev.filter((id) => id !== String(limnigrafo.id));
													});
												}}
											/>
											{limnigrafo.codigo}
										</label>
									);
								})}
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
											<th className="px-4 py-3">Desv. est.</th>
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

						{topError ? (
							<p className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
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
								{appliedFilters.busqueda ? ` (coincidencias en página: ${tableRows.length})` : ""}
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

					<section className="grid gap-6 lg:grid-cols-2">
						<form
							onSubmit={handleManualSubmit}
							className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]"
						>
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Carga manual</p>
							<p className="mb-4 mt-1 text-[14px] text-[#64748B]">Registro manual con validaciones.</p>

							<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Limnígrafo
									<select
										value={manualForm.limnigrafo}
										onChange={(event) => handleManualFormChange("limnigrafo", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									>
										<option value="">Seleccionar</option>
										{limnigrafos.map((limnigrafo) => (
											<option key={limnigrafo.id} value={String(limnigrafo.id)}>
												{limnigrafo.codigo}
											</option>
										))}
									</select>
								</label>

								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Fecha/hora
									<input
										type="datetime-local"
										value={manualForm.fecha_hora}
										onChange={(event) => handleManualFormChange("fecha_hora", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Altura del agua (m)
									<input
										type="text"
										value={manualForm.altura_agua}
										onChange={(event) => handleManualFormChange("altura_agua", event.target.value)}
										placeholder="Obligatorio"
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Presión (hPa)
									<input
										type="text"
										value={manualForm.presion}
										onChange={(event) => handleManualFormChange("presion", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Temperatura (°C)
									<input
										type="text"
										value={manualForm.temperatura}
										onChange={(event) => handleManualFormChange("temperatura", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>

								<label className="flex flex-col gap-1 text-[14px] font-semibold text-[#4B4B4B]">
									Batería (%)
									<input
										type="text"
										value={manualForm.nivel_de_bateria}
										onChange={(event) => handleManualFormChange("nivel_de_bateria", event.target.value)}
										className="rounded-xl border border-[#D3D4D5] p-3 text-[14px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
									/>
								</label>
							</div>

							<button
								type="submit"
								disabled={postMedicion.isPending}
								className="mt-4 rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-50"
							>
								{postMedicion.isPending ? "Guardando..." : "Guardar medición manual"}
							</button>
						</form>

						<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
							<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Importación de archivo</p>
							<p className="mb-4 mt-1 text-[14px] text-[#64748B]">Soporta JSON o CSV con columnas estándar de mediciones.</p>

							<label className="inline-flex cursor-pointer items-center rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-[14px] font-semibold text-[#334155]">
								Seleccionar archivo
								<input
									type="file"
									accept=".json,.csv"
									onChange={handleImportFileChange}
									className="hidden"
								/>
							</label>

							{importFileName ? (
								<p className="mt-3 text-[13px] text-[#64748B]">
									Archivo: <span className="font-semibold text-[#0F172A]">{importFileName}</span>
								</p>
							) : null}

							<div className="mt-4 max-h-[220px] overflow-auto rounded-xl border border-[#E2E8F0]">
								<table className="min-w-full text-left text-[13px] text-[#334155]">
									<thead className="bg-[#F8FAFC] text-[12px] uppercase tracking-wide text-[#64748B]">
										<tr>
											<th className="px-3 py-2">#</th>
											<th className="px-3 py-2">Fecha</th>
											<th className="px-3 py-2">Altura</th>
											<th className="px-3 py-2">Presión</th>
											<th className="px-3 py-2">Temperatura</th>
										</tr>
									</thead>
									<tbody>
										{importRows.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-3 py-4 text-center text-[#64748B]">Sin filas cargadas.</td>
											</tr>
										) : (
											importRows.slice(0, 20).map((row, index) => (
												<tr key={`import-row-${index}`} className="border-t border-[#E2E8F0]">
													<td className="px-3 py-2">{index + 1}</td>
													<td className="px-3 py-2">{row.fecha_hora ? formatDate(row.fecha_hora) : "-"}</td>
													<td className="px-3 py-2">{formatNumber(row.altura_agua, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.presion, 2)}</td>
													<td className="px-3 py-2">{formatNumber(row.temperatura, 2)}</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>

							<button
								type="button"
								onClick={handleImportSubmit}
								disabled={isImporting || importRows.length === 0}
								className="mt-4 rounded-xl bg-[#0EA5E9] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-50"
							>
								{isImporting ? "Importando..." : "Importar al backend"}
							</button>
						</div>
					</section>

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
