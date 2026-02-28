"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import FilterBar, { FilterOption, HistorialFilters } from "@componentes/FilterBar";
import HistorialTable, { HistoryRow } from "@componentes/HistorialTable";
import { useGetUsuarios } from "@servicios/api";
import { HistorialItem, useGetHistoriales } from "@servicios/api/django.api";

const PAGE_SIZE = 10;

const EMPTY_FILTERS: HistorialFilters = {
	usuario: "",
	accion: "",
	entidad: "",
	desde: "",
	hasta: "",
};

const ACTION_OPTIONS: FilterOption[] = [
	{ label: "Todos", value: "" },
	{ label: "Creación", value: "created" },
	{ label: "Modificación", value: "modified" },
	{ label: "Eliminación", value: "deleted" },
	{ label: "Carga manual de datos", value: "manual_data_load" },
];

const ACTION_LABELS: Record<string, string> = {
	created: "Creación",
	modified: "Modificación",
	deleted: "Eliminación",
	manual_data_load: "Carga manual de datos",
};

const STATUS_LABELS: Record<string, string> = {
	success: "Exitoso",
	failed: "Fallido",
	review: "En revisión",
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

function getActionLabel(type: string): string {
	return ACTION_LABELS[type] ?? type;
}

function getStatusLabel(status: string): string {
	return STATUS_LABELS[status] ?? status;
}

function formatDateTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return DATE_TIME_FORMATTER.format(date);
}

function mapHistorialToRow(item: HistorialItem): HistoryRow {
	return {
		id: String(item.id),
		usuario: item.username || "Sistema",
		accion: getActionLabel(item.type),
		entidad: item.model_name || "-",
		descripcion: item.description || item.object_repr || "-",
		fechaHora: formatDateTime(item.date),
		registroId: item.object_id || "-",
		estado: getStatusLabel(item.status),
	};
}

export default function HistorialPage() {
	const searchParams = useSearchParams();
	const usuarioParam = searchParams.get("usuario")?.trim() ?? "";

	const [filters, setFilters] = useState<HistorialFilters>({
		...EMPTY_FILTERS,
		usuario: usuarioParam,
	});
	const [appliedFilters, setAppliedFilters] = useState<HistorialFilters>({
		...EMPTY_FILTERS,
		usuario: usuarioParam,
	});
	const [currentPage, setCurrentPage] = useState(1);

	const historialQueryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(PAGE_SIZE),
			page: String(currentPage),
		};

		if (appliedFilters.usuario) {
			params.usuario = appliedFilters.usuario;
		}
		if (appliedFilters.accion) {
			params.type = appliedFilters.accion;
		}
		if (appliedFilters.entidad) {
			params.model = appliedFilters.entidad;
		}
		if (appliedFilters.desde) {
			params.desde = appliedFilters.desde;
		}
		if (appliedFilters.hasta) {
			params.hasta = appliedFilters.hasta;
		}

		return params;
	}, [appliedFilters, currentPage]);

	const {
		data: historialData,
		isLoading: isLoadingHistorial,
		isFetching: isFetchingHistorial,
		error: historialError,
	} = useGetHistoriales({
		params: {
			queryParams: historialQueryParams,
		},
	});

	const { data: usuariosData } = useGetUsuarios({});

	const userOptions = useMemo<FilterOption[]>(() => {
		const usernames = new Set<string>();

		(Array.isArray(usuariosData) ? usuariosData : []).forEach((usuario) => {
			const username = usuario.nombre_usuario?.trim();
			if (username) {
				usernames.add(username);
			}
		});

		(historialData?.results ?? []).forEach((item) => {
			const username = item.username?.trim();
			if (username) {
				usernames.add(username);
			}
		});

		if (usuarioParam) {
			usernames.add(usuarioParam);
		}

		return [
			{ label: "Todos", value: "" },
			...Array.from(usernames)
				.sort((a, b) => a.localeCompare(b))
				.map((username) => ({ label: username, value: username })),
		];
	}, [usuariosData, historialData, usuarioParam]);

	const entityOptions = useMemo<FilterOption[]>(() => {
		const entities = new Set<string>(["Usuario", "Limnígrafo", "Métrica"]);

		(historialData?.results ?? []).forEach((item) => {
			const entity = item.model_name?.trim();
			if (entity) {
				entities.add(entity);
			}
		});

		return [
			{ label: "Todas", value: "" },
			...Array.from(entities)
				.sort((a, b) => a.localeCompare(b))
				.map((entity) => ({ label: entity, value: entity })),
		];
	}, [historialData]);

	const rows = useMemo<HistoryRow[]>(
		() => (historialData?.results ?? []).map(mapHistorialToRow),
		[historialData],
	);

	const totalRecords = historialData?.count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
	const startRow = totalRecords === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1;
	const endRow = Math.min(currentPage * PAGE_SIZE, totalRecords);

	function handleFilterChange(field: keyof HistorialFilters, value: string) {
		setFilters((previous) => ({
			...previous,
			[field]: value,
		}));
	}

	function handleApplyFilters() {
		setAppliedFilters(filters);
		setCurrentPage(1);
	}

	function handleClearFilters() {
		const resetFilters = {
			...EMPTY_FILTERS,
			usuario: usuarioParam,
		};
		setFilters(resetFilters);
		setAppliedFilters(resetFilters);
		setCurrentPage(1);
	}

	function handlePrevPage() {
		setCurrentPage((previous) => Math.max(1, previous - 1));
	}

	function handleNextPage() {
		setCurrentPage((previous) => Math.min(totalPages, previous + 1));
	}

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018]">Historial</h1>
						<p className="text-[16px] text-[#4B4B4B]">
							Registros de acciones sobre limnígrafos, métricas y usuarios.
						</p>
					</header>

					<FilterBar
						users={userOptions}
						actions={ACTION_OPTIONS}
						entities={entityOptions}
						values={filters}
						onChange={handleFilterChange}
						onApply={handleApplyFilters}
						onClear={handleClearFilters}
						isLoading={isFetchingHistorial}
					/>

					<section className="flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
									Historial de acciones
								</p>
							</div>
							<span className="rounded-full bg-[#F1F5F9] px-4 py-1 text-[13px] font-semibold text-[#475569]">
								{isLoadingHistorial ? "Cargando..." : `${totalRecords} registros`}
							</span>
						</div>

						{historialError ? (
							<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B]">
								No se pudo cargar el historial. Intentalo nuevamente.
							</p>
						) : null}

						<HistorialTable
							rows={rows}
							emptyMessage={
								isLoadingHistorial
									? "Cargando historial..."
									: "No hay acciones registradas con los filtros seleccionados."
							}
						/>

						<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
							<p className="text-[13px] text-[#64748B]">
								Mostrando {startRow}-{endRow} de {totalRecords}. Página {currentPage} de {totalPages}
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handlePrevPage}
									disabled={currentPage <= 1 || isFetchingHistorial}
									className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40"
								>
									Anterior
								</button>
								<button
									type="button"
									onClick={handleNextPage}
									disabled={currentPage >= totalPages || isFetchingHistorial}
									className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40"
								>
									Siguiente
								</button>
							</div>
						</div>
					</section>
				</div>
			</main>
		</PaginaBase>
	);
}
