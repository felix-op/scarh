"use client";

import { ChangeEvent, FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import BotonVariante from "@componentes/botones/BotonVariante";
import {
	ImportPreviewRow,
	MedicionPaginatedResponse,
	MedicionImportRequest,
	MedicionPostRequest,
	MedicionResponse,
	useGetMediciones,
	usePostImportarMedicionesLote,
	usePostMedicion,
	usePostValidarImportacionMediciones,
} from "@servicios/api/django.api";
import ModalCargaManualMedicion, {
	ManualFormState,
} from "@componentes/mediciones/ModalCargaManualMedicion";
import ModalImportacionMediciones from "@componentes/mediciones/ModalImportacionMediciones";
import SeccionHistorialMediciones from "./secciones/SeccionHistorialMediciones";
import { HistorialFilters, MedicionRow } from "./secciones/types";
import {
	applyFallbackLimnigrafo,
	buildImportRequestRows,
	buildCsvContent,
	downloadTextFile,
	formatDate,
	formatNumber,
	formatTime,
	parseImportRowsByFilename,
	parseNumeric,
	toDatetimeLocalInputValue,
} from "./utils";
import { LimnigrafoResponse } from "types/limnigrafos";
import { Paginado } from "@servicios/api/types";
import { useGetLimnigrafos } from "@servicios/api/limnigrafos";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 75, 100] as const;
const EXPORT_PAGE_SIZE = 1000;
const MEDICIONES_REFETCH_INTERVAL_MS = 15000;

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
		hasta: "",
	};
}

function getDefaultHistorialFilters(): HistorialFilters {
	const { desde, hasta } = getDefaultDateRange();
	return {
		limnigrafo: [],
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

function MedicionesContent() {
	const searchParams = useSearchParams();
	const limnigrafoIdParam = searchParams.get("limnigrafo") ?? searchParams.get("id");
	const limnigrafoInicial = limnigrafoIdParam && /^\d+$/.test(limnigrafoIdParam)
		? [limnigrafoIdParam]
		: [];
	const [historialFilters, setHistorialFilters] = useState<HistorialFilters>(() => ({
		...getDefaultHistorialFilters(),
		limnigrafo: limnigrafoInicial,
	}));
	const [appliedHistorialFilters, setAppliedHistorialFilters] = useState<HistorialFilters>(() => ({
		...getDefaultHistorialFilters(),
		limnigrafo: limnigrafoInicial,
	}));
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [mensaje, setMensaje] = useState<string | null>(null);
	const [errorAccion, setErrorAccion] = useState<string | null>(null);
	const [manualModalMessage, setManualModalMessage] = useState<string | null>(null);
	const [manualModalError, setManualModalError] = useState<string | null>(null);
	const [importModalMessage, setImportModalMessage] = useState<string | null>(null);
	const [importModalError, setImportModalError] = useState<string | null>(null);
	const [isValidatingImport, setIsValidatingImport] = useState(false);
	const [isImportValidated, setIsImportValidated] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isManualModalOpen, setIsManualModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importRowsSource, setImportRowsSource] = useState<ImportPreviewRow[]>([]);
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

		if (appliedHistorialFilters.limnigrafo.length > 0) {
			params.limnigrafo = appliedHistorialFilters.limnigrafo.join(",");
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

		const search = appliedHistorialFilters.busqueda.trim();
		if (search) {
			params.search = search;
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
			refetchInterval: MEDICIONES_REFETCH_INTERVAL_MS,
			refetchIntervalInBackground: true,
		},
	});

	const postMedicion = usePostMedicion();
	const validarImportacion = usePostValidarImportacionMediciones();
	const importarLote = usePostImportarMedicionesLote();

	const fallbackLimnigrafoId = useMemo(() => {
		const parsed = Number.parseInt(
			importFallbackLimnigrafo || appliedHistorialFilters.limnigrafo[0] || manualForm.limnigrafo,
			10,
		);
		return Number.isNaN(parsed) ? null : parsed;
	}, [appliedHistorialFilters.limnigrafo, importFallbackLimnigrafo, manualForm.limnigrafo]);

	const importRows = useMemo(
		() => applyFallbackLimnigrafo(importRowsSource, fallbackLimnigrafoId),
		[importRowsSource, fallbackLimnigrafoId],
	);

	const tableRows = useMemo(
		() =>
			(medicionesData?.results ?? []).map((medicion) =>
				mapMedicionToRow(
					medicion,
					limnigrafoNameById.get(medicion.limnigrafo) ?? `ID ${medicion.limnigrafo}`,
				),
			),
		[limnigrafoNameById, medicionesData],
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

	function handleManualModalOpenChange(open: boolean) {
		setIsManualModalOpen(open);
		if (!open) {
			setManualModalError(null);
			setManualModalMessage(null);
		}
	}

	function handleImportModalOpenChange(open: boolean) {
		setIsImportModalOpen(open);
		if (!open) {
			setImportModalError(null);
			setImportModalMessage(null);
			setIsImportValidated(false);
			setIsValidatingImport(false);
			setIsImporting(false);
			setImportRowsSource([]);
			setImportFileName("");
			setImportFuente(null);
			setImportFallbackLimnigrafo("");
		}
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
		setManualModalError(null);
		setManualModalMessage(null);

		const limnigrafoId = Number.parseInt(
			manualForm.limnigrafo || appliedHistorialFilters.limnigrafo[0] || "",
			10,
		);
		if (Number.isNaN(limnigrafoId)) {
			setManualModalError("Seleccioná un limnígrafo para cargar la medición manual.");
			return;
		}

		const altura = parseNumeric(manualForm.altura_agua);
		if (altura === null) {
			setManualModalError("La altura del agua es obligatoria y debe ser numérica.");
			return;
		}

		const presion = parseNumeric(manualForm.presion);
		const temperatura = parseNumeric(manualForm.temperatura);
		const bateria = parseNumeric(manualForm.nivel_de_bateria);
		if (bateria !== null && (bateria < 0 || bateria > 100)) {
			setManualModalError("El nivel de batería debe estar entre 0 y 100.");
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
			handleManualModalOpenChange(false);
			setManualForm((prev) => ({
				...prev,
				altura_agua: "",
				presion: "",
				temperatura: "",
				nivel_de_bateria: "",
				fecha_hora: toDatetimeLocalInputValue(new Date()),
			}));
		} catch (error) {
			setManualModalError(error instanceof Error ? error.message : "No se pudo registrar la medición manual.");
		}
	}

	async function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
		setImportModalError(null);
		setImportModalMessage(null);
		setIsImportValidated(false);

		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		if (!file.name.toLowerCase().endsWith(".csv") && !file.name.toLowerCase().endsWith(".json")) {
			setImportRowsSource([]);
			setImportFileName("");
			setImportFuente(null);
			setImportModalError("El archivo debe ser CSV o JSON.");
			event.target.value = "";
			return;
		}

		if (file.size > (5 * 1024 * 1024)) {
			setImportRowsSource([]);
			setImportFileName("");
			setImportFuente(null);
			setImportModalError("El archivo supera el tamaño máximo permitido de 5 MB.");
			event.target.value = "";
			return;
		}

		try {
			const text = await file.text();
			const rows = parseImportRowsByFilename(text, file.name);
			if (rows.length === 0) {
				setImportRowsSource([]);
				setImportFileName("");
				setImportFuente(null);
				setImportModalError("No se encontraron filas válidas en el archivo.");
				return;
			}

			setImportRowsSource(rows);
			setImportFileName(file.name);
			setImportFuente(inferImportFuenteByFileName(file.name));
			setImportModalMessage(`Archivo cargado: ${rows.length} filas listas para validar.`);
		} catch (error) {
			setImportRowsSource([]);
			setImportFileName("");
			setImportFuente(null);
			setImportModalError(error instanceof Error ? error.message : "No se pudo procesar el archivo seleccionado.");
		} finally {
			event.target.value = "";
		}
	}

	function buildImportPayload(): MedicionImportRequest | null {
		if (!importFuente || !importFileName) {
			return null;
		}

		return {
			file_name: importFileName,
			fuente: importFuente,
			fallback_limnigrafo_id: fallbackLimnigrafoId,
			rows: buildImportRequestRows(importRows),
		};
	}

	async function handleValidateImport() {
		if (importRows.length === 0) {
			setImportModalError("Cargá un archivo con mediciones antes de importar.");
			return;
		}
		if (importRows.some((row) => row.status !== "valid")) {
			setImportModalError(null);
			return;
		}

		const payload = buildImportPayload();
		if (!payload) {
			setImportModalError("No se pudo preparar el lote de importación.");
			return;
		}

		setIsValidatingImport(true);
		setImportModalError(null);
		setImportModalMessage(null);

		try {
			const response = await validarImportacion.mutateAsync({ data: payload });
			setImportRowsSource(response.rows);
			setIsImportValidated(response.is_valid);
			if (response.is_valid) {
				setImportModalMessage(`Validación completada: ${response.summary.valid_rows} filas listas para importar.`);
			} else {
				setImportModalError("La validación detectó filas con errores o duplicados. Revisá el detalle antes de continuar.");
			}
		} catch (error) {
			setIsImportValidated(false);
			setImportModalError(error instanceof Error ? error.message : "No se pudo validar la importación.");
		} finally {
			setIsValidatingImport(false);
		}
	}

	async function handleImportSubmit() {
		if (!isImportValidated) {
			await handleValidateImport();
			return;
		}

		const payload = buildImportPayload();
		if (!payload) {
			setImportModalError("No se pudo preparar el lote de importación.");
			return;
		}

		setIsImporting(true);
		setImportModalError(null);
		setImportModalMessage(null);

		try {
			const response = await importarLote.mutateAsync({ data: payload });
			await refetchMediciones();
			const importSummary = `Importación finalizada. Filas guardadas: ${response.imported_rows}.`;
			setImportModalMessage(importSummary);
			setMensaje(importSummary);
			setImportRowsSource([]);
			setImportFileName("");
			setImportFuente(null);
			setIsImportValidated(false);
			handleImportModalOpenChange(false);
		} catch (error) {
			setImportModalError(error instanceof Error ? error.message : "No se pudo completar la importación.");
			setIsImportValidated(false);
		} finally {
			setIsImporting(false);
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
							<BotonVariante
								type="button"
								onClick={() => handleManualModalOpenChange(true)}
								variant="guardar"
								className="text-[14px]"
							>
								<span className="text-2xl icon-[mdi--pencil]" aria-hidden="true" />
								<span>Carga manual</span>
							</BotonVariante>
							<BotonVariante
								type="button"
								onClick={() => handleImportModalOpenChange(true)}
								variant="agregar"
								className="text-[14px]"
							>
								<span className="text-2xl icon-[mdi--upload]" aria-hidden="true" />
								<span>Importación</span>
							</BotonVariante>
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
						onOpenChange={handleManualModalOpenChange}
						manualForm={manualForm}
						limnigrafos={limnigrafos}
						isSubmitting={postMedicion.isPending}
						actionError={manualModalError}
						actionMessage={manualModalMessage}
						onManualFormChange={handleManualFormChange}
						onSubmit={handleManualSubmit}
					/>

					<ModalImportacionMediciones
						open={isImportModalOpen}
						onOpenChange={handleImportModalOpenChange}
						limnigrafos={limnigrafos}
						importFallbackLimnigrafo={importFallbackLimnigrafo}
						onImportFallbackChange={(value) => {
							setImportFallbackLimnigrafo(value);
							setIsImportValidated(false);
						}}
						importFileName={importFileName}
						importRows={importRows}
						isImportValidated={isImportValidated}
						isValidating={isValidatingImport}
						isImporting={isImporting}
						actionError={importModalError}
						actionMessage={importModalMessage}
						onFileChange={handleImportFileChange}
						onValidateSubmit={handleValidateImport}
						onImportSubmit={handleImportSubmit}
					/>
				</div>
			</main>
		</PaginaBase>
	);
}

export default function MedicionesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center text-xl text-[#4B4B4B] dark:text-[#94A3B8]">
					Cargando mediciones...
				</div>
			}
		>
			<MedicionesContent />
		</Suspense>
	);
}
