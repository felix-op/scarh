"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import PaginaBase from "@componentes/base/PaginaBase";
import {
	MedicionPaginatedResponse,
	MedicionPostRequest,
	MedicionResponse,
	useGetMediciones,
	usePostMedicion,
} from "@servicios/api/django.api";
import ModalCargaManualMedicion, {
	ManualFormState,
} from "@componentes/mediciones/ModalCargaManualMedicion";
import ModalImportacionMediciones from "@componentes/mediciones/ModalImportacionMediciones";
import SeccionHistorialMediciones from "./secciones/SeccionHistorialMediciones";
import { HistorialFilters, MedicionRow } from "./secciones/types";
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
import { LimnigrafoResponse } from "types/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 75, 100] as const;
const EXPORT_PAGE_SIZE = 1000;

const HEADER_ACTION_PRIMARY_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#CFE2F1] bg-[#DDEEFF] px-6 text-sm font-semibold text-[#258CC6] shadow-[0px_4px_10px_rgba(37,140,198,0.22)] transition hover:bg-[#CFE5FB] disabled:cursor-not-allowed disabled:opacity-70 dark:border-[#1D4ED8] dark:bg-[#0B2A43] dark:text-[#93C5FD] dark:hover:bg-[#12385B]";

const HEADER_ACTION_SECONDARY_BUTTON_CLASS =
	"inline-flex h-11 items-center gap-2 rounded-full border border-[#EFCAD5] bg-[#F7E0E8] px-6 text-sm font-semibold text-[#F05275] shadow-[0px_4px_10px_rgba(240,82,117,0.2)] transition hover:bg-[#F3D3DE] disabled:cursor-not-allowed disabled:opacity-70 dark:border-[#9D174D] dark:bg-[#3F1222] dark:text-[#FDA4AF] dark:hover:bg-[#4D162B]";

function inferImportFuenteByFileName(fileName: string): "import_csv" | "import_json" | null {
	const lowerName = fileName.toLowerCase();
	if (lowerName.endsWith(".csv")) {
		return "import_csv";
	}
	if (lowerName.endsWith(".json")) {
		return "import_json";
	}
	return null;
}

function getDefaultDateRange() {
	const now = new Date();
	const from = new Date(now);
	from.setDate(now.getDate() - 7);

	return {
		desde: toDatetimeLocalInputValue(from),
		hasta: toDatetimeLocalInputValue(now),
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

export default function MedicionesPage() {
	const [historialFilters, setHistorialFilters] = useState<HistorialFilters>(getDefaultHistorialFilters);
	const [appliedHistorialFilters, setAppliedHistorialFilters] = useState<HistorialFilters>(getDefaultHistorialFilters);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [errorAccion, setErrorAccion] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isManualModalOpen, setIsManualModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importRows, setImportRows] = useState<ParsedMedicionImportRow[]>([]);
	const [importFileName, setImportFileName] = useState("");
	const [importFuente, setImportFuente] = useState<"import_csv" | "import_json" | null>(null);
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

	const limnigrafosPayload = limnigrafosData as Paginado<LimnigrafoResponse> | LimnigrafoResponse[] | undefined;
	const limnigrafos = useMemo(
		() => (
			Array.isArray(limnigrafosPayload)
				? limnigrafosPayload
				: limnigrafosPayload?.results ?? []
		),
		[limnigrafosPayload],
	);

	const limnigrafoNameById = useMemo(() => {
		const map = new Map<number, string>();
		limnigrafos.forEach((limnigrafo) => {
			map.set(limnigrafo.id, limnigrafo.codigo);
		});
		return map;
	}, [limnigrafos]);

	const queryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(pageSize),
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
			params.fecha_desde = desdeIso;
		}

		const hastaIso = toIsoString(appliedHistorialFilters.hasta);
		if (hastaIso) {
			params.fecha_hasta = hastaIso;
		}

		return params;
	}, [appliedHistorialFilters, currentPage, pageSize]);

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
	const totalPages = Math.max(1, Math.ceil(serverCount / pageSize));
	const startRow = serverCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
	const endRow = Math.min(currentPage * pageSize, serverCount);

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
				setImportFuente(null);
				setErrorAccion("No se encontraron filas válidas en el archivo.");
				return;
			}

			setImportRows(rows);
			setImportFileName(file.name);
			setImportFuente(inferImportFuenteByFileName(file.name));
			const rowsWithLimnigrafo = rows.filter((row) => Number.isInteger(row.limnigrafo)).length;
			const rowsUsingFallback = rows.length - rowsWithLimnigrafo;
			setMensaje(
				`Archivo cargado: ${rows.length} filas listas para importar. `
				+ `${rowsWithLimnigrafo} con limnígrafo desde archivo`
				+ (rowsUsingFallback > 0 ? ` y ${rowsUsingFallback} usarán limnígrafo por defecto.` : "."),
			);
		} catch (error) {
			setImportRows([]);
			setImportFileName("");
			setImportFuente(null);
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
		const importedByLimnigrafo = new Map<number, number>();

		for (let index = 0; index < importRows.length; index += 1) {
			const row = importRows[index];
			const limnigrafoIdFromRow = row.limnigrafo;
			const limnigrafoId = limnigrafoIdFromRow ?? fallbackLimnigrafoId;

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
				fuente: importFuente ?? undefined,
			};

			try {
				await postMedicion.mutateAsync({ data: payload });
				successCount += 1;
				importedByLimnigrafo.set(
					limnigrafoId,
					(importedByLimnigrafo.get(limnigrafoId) ?? 0) + 1,
				);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Error desconocido";
				importErrors.push(`Fila ${index + 1}: ${message}`);
			}
		}

		setIsImporting(false);
		await refetchMediciones();

		if (successCount > 0) {
			const distribution = [...importedByLimnigrafo.entries()]
				.sort(([leftId], [rightId]) => leftId - rightId)
				.map(([limnigrafoId, count]) => {
					const limnigrafoLabel = limnigrafoNameById.get(limnigrafoId) ?? `ID ${limnigrafoId}`;
					return `${limnigrafoLabel}: ${count}`;
				})
				.join(", ");

			setMensaje(
				`Importación finalizada. Filas guardadas: ${successCount}.`
				+ (distribution ? ` Distribución por limnígrafo: ${distribution}.` : ""),
			);
		}

		if (importErrors.length > 0) {
			setErrorAccion(importErrors.slice(0, 4).join(" "));
		}

		if (successCount > 0 && importErrors.length === 0) {
			setImportRows([]);
			setImportFileName("");
			setImportFuente(null);
			setIsImportModalOpen(false);
		}
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div className="flex flex-col gap-1">
							<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">Mediciones</h1>
							<p className="text-base text-[#4D5562] dark:text-[#94A3B8]">
								Gestión operativa de mediciones históricas, análisis, exportación e importación.
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

					<SeccionHistorialMediciones
						filters={historialFilters}
						limnigrafos={limnigrafos}
						onLimnigrafoChange={(value) => handleHistorialFilterChange("limnigrafo", value)}
						onFuenteChange={(value) => handleHistorialFilterChange("fuente", value)}
						onDesdeChange={(value) => handleHistorialFilterChange("desde", value)}
						onHastaChange={(value) => handleHistorialFilterChange("hasta", value)}
						onBusquedaChange={(value) => handleHistorialFilterChange("busqueda", value)}
						onApplyFilters={handleApplyHistorialFilters}
						onClearFilters={handleClearHistorialFilters}
						onExport={handleExport}
						isExporting={isExporting}
						hasTopError={Boolean(topError)}
						rows={tableRows}
						isLoading={isLoading}
						serverCount={serverCount}
						startRow={startRow}
						endRow={endRow}
						currentPage={currentPage}
						totalPages={totalPages}
						pageSize={pageSize}
						pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
						isFetching={isFetchingMediciones}
						hasBusqueda={Boolean(appliedHistorialFilters.busqueda)}
						actionError={errorAccion}
						actionMessage={mensaje}
						onPageSizeChange={(value) => {
							setPageSize(value);
							setCurrentPage(1);
						}}
						onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
						onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
					/>

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
				</div>
			</main>
		</PaginaBase>
	);
}
