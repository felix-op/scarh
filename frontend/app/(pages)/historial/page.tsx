"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaginaBase from "@componentes/base/PaginaBase";
import FilterBar, { FilterOption, HistorialFilters } from "@componentes/FilterBar";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig, PaginationConfig } from "@componentes/tabla/types";
import { Paginado } from "@servicios/api/types";
import { HistorialItem, useGetHistoriales } from "@servicios/api/django.api";
import { UsuarioResponse } from "types/usuarios";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const USERS_FETCH_PAGE_SIZE = 100;

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

type HistoryRow = {
	id: string;
	usuario: string;
	accion: string;
	entidad: string;
	descripcion: string;
	fecha: string;
	hora: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	hour: "2-digit",
	minute: "2-digit",
});

function getActionLabel(type: string): string {
	return ACTION_LABELS[type] ?? type;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return DATE_FORMATTER.format(date);
}

function formatTime(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return TIME_FORMATTER.format(date);
}

function mapHistorialToRow(item: HistorialItem): HistoryRow {
	return {
		id: String(item.id),
		usuario: item.username || "Sistema",
		accion: getActionLabel(item.type),
		entidad: item.model_name || "-",
		descripcion: item.description || item.object_repr || "-",
		fecha: formatDate(item.date),
		hora: formatTime(item.date),
	};
}

async function fetchAllUsernames(): Promise<string[]> {
	const usernames = new Set<string>();
	let page = 1;

	while (true) {
		const query = new URLSearchParams({
			limit: String(USERS_FETCH_PAGE_SIZE),
			page: String(page),
		});
		const response = await fetch(`/api/proxy/usuarios/?${query.toString()}`, {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error("No se pudieron cargar los usuarios del historial.");
		}

		const payload = await response.json() as Paginado<UsuarioResponse>;
		payload.results.forEach((usuario) => {
			const username = usuario.nombre_usuario?.trim();
			if (username) {
				usernames.add(username);
			}
		});

		if (!payload.next) {
			break;
		}

		page += 1;
	}

	return Array.from(usernames);
}

const historyColumns: ColumnConfig<HistoryRow>[] = [
	{
		id: "usuario",
		header: "Usuario",
		cell: (row) => <span className="px-4 py-3 font-semibold text-[#011018] dark:text-[#E2E8F0]">{row.usuario}</span>,
	},
	{
		id: "accion",
		header: "Acción realizada",
		cell: (row) => <span className="px-4 py-3">{row.accion}</span>,
	},
	{
		id: "entidad",
		header: "Entidad afectada",
		cell: (row) => <span className="px-4 py-3 text-[#0982C8] dark:text-[#7DD3FC]">{row.entidad}</span>,
	},
	{
		id: "descripcion",
		header: "Descripción",
		cell: (row) => <span className="px-4 py-3 text-[#4B4B4B] dark:text-[#CBD5E1]">{row.descripcion}</span>,
	},
	{
		id: "fechaHora",
		header: "Fecha y hora",
		cell: (row) => (
			<div className="px-4 py-3 text-[#4B4B4B] dark:text-[#CBD5E1]">
				<p className="leading-5">{row.fecha}</p>
				<p className="text-[13px] leading-5 text-[#64748B] dark:text-[#94A3B8]">{row.hora}</p>
			</div>
		),
	},
];

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
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [isFilterOpen, setIsFilterOpen] = useState(true);
	const [allUsernames, setAllUsernames] = useState<string[]>([]);

	const historialQueryParams = useMemo(() => {
		const params: Record<string, string> = {
			limit: String(pageSize),
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
	}, [appliedFilters, currentPage, pageSize]);

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

	useEffect(() => {
		let cancelled = false;

		async function loadAllUsernames() {
			try {
				const usernames = await fetchAllUsernames();
				if (!cancelled) {
					setAllUsernames(usernames);
				}
			} catch (error) {
				console.warn("No se pudieron cargar todos los usuarios para filtros de historial.", error);
			}
		}

		loadAllUsernames();

		return () => {
			cancelled = true;
		};
	}, []);

	const userOptions = useMemo<FilterOption[]>(() => {
		const usernames = new Set<string>();

		allUsernames.forEach((username) => usernames.add(username));

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
	}, [allUsernames, historialData, usuarioParam]);

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
	const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
	const startRow = totalRecords === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
	const endRow = Math.min(currentPage * pageSize, totalRecords);
	const paginationConfig: PaginationConfig = {
		page: currentPage,
		maxPage: totalPages,
		prevPage: () => {
			if (isFetchingHistorial) return;
			setCurrentPage((previous) => Math.max(1, previous - 1));
		},
		nextPage: () => {
			if (isFetchingHistorial) return;
			setCurrentPage((previous) => Math.min(totalPages, previous + 1));
		},
		lengthPages: pageSize,
		lengthOptions: [...PAGE_SIZE_OPTIONS],
		changeLength: (value) => {
			if (isFetchingHistorial) return;
			setPageSize(value);
			setCurrentPage(1);
		},
	};

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

	return (
		<PaginaBase>
			<main className="flex flex-1 justify-center px-6 py-10">
				<div className="flex w-full max-w-[1568px] flex-col gap-8">
					<header className="flex flex-col gap-1">
						<h1 className="text-[34px] font-semibold text-[#011018] dark:text-[#E2E8F0]">Historial</h1>
						<p className="text-[16px] text-[#4B4B4B] dark:text-[#94A3B8]">
							Registros de acciones sobre limnígrafos, métricas y usuarios.
						</p>
					</header>

					{isFilterOpen ? (
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
					) : null}

					<section className="flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
									Historial de acciones
								</p>
							</div>
						</div>

						{historialError ? (
							<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
								No se pudo cargar el historial. Intentalo nuevamente.
							</p>
						) : null}

						<DataTable
							data={rows}
							columns={historyColumns}
							rowIdKey="id"
							onFilter={() => setIsFilterOpen((previous) => !previous)}
							enableRowAnimation={false}
							loadingRows={6}
							isLoading={isLoadingHistorial}
							paginationConfig={paginationConfig}
							showBottomPagination
							emptyStateContent={
								<span className="text-[#6B7280] dark:text-[#94A3B8]">
									No hay acciones registradas con los filtros seleccionados.
								</span>
							}
						/>

						<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
							<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
								Mostrando {startRow}-{endRow} de {totalRecords}. Página {currentPage} de {totalPages}
							</p>
						</div>
					</section>
				</div>
			</main>
		</PaginaBase>
	);
}
