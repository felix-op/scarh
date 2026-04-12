"use client";

import MultiSelect, { type MultiSelectOption } from "@componentes/components/ui/multi-select";
import BotonVariante from "@componentes/botones/BotonVariante";
import TextField from "@componentes/campos/TextField";
import Selector from "@componentes/campos/Selector";
import FiltrosContenedor from "@componentes/filtros/FiltrosContenedor";
import Label from "@componentes/formularios/Label";
import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig, PaginationConfig } from "@componentes/tabla/types";
import { LimnigrafoResponse } from "types/limnigrafos";
import { FuenteFiltro, HistorialFilters, MedicionRow } from "./types";

function getFuenteChip(fuente: string): { label: string; className: string } {
	if (fuente === "manual") {
		return {
			label: "Manual",
			className: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] dark:border-[#A16207] dark:bg-[#422006] dark:text-[#FCD34D]",
		};
	}

	if (fuente === "import_csv") {
		return {
			label: "Importación CSV",
			className: "border-[#C4B5FD] bg-[#F5F3FF] text-[#5B21B6] dark:border-[#7C3AED] dark:bg-[#2A1457] dark:text-[#C4B5FD]",
		};
	}

	if (fuente === "import_json") {
		return {
			label: "Importación JSON",
			className: "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] dark:border-[#047857] dark:bg-[#0A2E25] dark:text-[#6EE7B7]",
		};
	}

	return {
		label: "Automático",
		className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF] dark:border-[#1D4ED8] dark:bg-[#0B2A43] dark:text-[#93C5FD]",
	};
}

const tableColumns: ColumnConfig<MedicionRow>[] = [
	{
		id: "limnigrafo",
		header: "Limnígrafo",
		cell: (row) => <span className="px-4 py-3 font-semibold text-[#011018] dark:text-[#E2E8F0]">{row.limnigrafo}</span>,
	},
	{
		id: "fuente",
		header: "Fuente",
		cell: (row) => {
			const fuenteChip = getFuenteChip(row.fuente);
			return (
				<div className="px-4 py-3">
					<span className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${fuenteChip.className}`}>
						{fuenteChip.label}
					</span>
				</div>
			);
		},
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
			<div className="px-4 py-3 text-[#4B4B4B] dark:text-[#CBD5E1]">
				<p className="leading-5">{row.fecha}</p>
				<p className="text-[13px] leading-5 text-[#64748B] dark:text-[#94A3B8]">{row.hora}</p>
			</div>
		),
	},
];

type SeccionHistorialMedicionesProps = {
	filters: HistorialFilters;
	limnigrafos: LimnigrafoResponse[];
	onLimnigrafoChange: (value: string[]) => void;
	onFuenteChange: (value: FuenteFiltro) => void;
	onDesdeChange: (value: string) => void;
	onHastaChange: (value: string) => void;
	onBusquedaChange: (value: string) => void;
	onApplyFilters: () => void;
	onClearFilters: () => void;
	onExport: (format: "csv" | "json") => void;
	isExporting: boolean;
	hasTopError: boolean;
	rows: MedicionRow[];
	isLoading: boolean;
	serverCount: number;
	startRow: number;
	endRow: number;
	currentPage: number;
	totalPages: number;
	pageSize: number;
	pageSizeOptions: number[];
	isFetching: boolean;
	hasBusqueda: boolean;
	onPageSizeChange: (value: number) => void;
	onPrevPage: () => void;
	onNextPage: () => void;
	actionError: string | null;
	actionMessage: string | null;
};

export default function SeccionHistorialMediciones({
	filters,
	limnigrafos,
	onLimnigrafoChange,
	onFuenteChange,
	onDesdeChange,
	onHastaChange,
	onBusquedaChange,
	onApplyFilters,
	onClearFilters,
	onExport,
	isExporting,
	hasTopError,
	rows,
	isLoading,
	serverCount,
	startRow,
	endRow,
	currentPage,
	totalPages,
	pageSize,
	pageSizeOptions,
	isFetching,
	hasBusqueda,
	onPageSizeChange,
	onPrevPage,
	onNextPage,
	actionError,
	actionMessage,
}: SeccionHistorialMedicionesProps) {
	const limnigrafoOptions: MultiSelectOption[] = limnigrafos.map((limnigrafo) => ({
		value: String(limnigrafo.id),
		label: limnigrafo.codigo,
	}));
	const paginationConfig: PaginationConfig = {
		page: currentPage,
		maxPage: totalPages,
		prevPage: () => {
			if (isFetching) return;
			onPrevPage();
		},
		nextPage: () => {
			if (isFetching) return;
			onNextPage();
		},
		lengthPages: pageSize,
		lengthOptions: pageSizeOptions,
		changeLength: (value) => {
			if (isFetching) return;
			onPageSizeChange(value);
		},
	};

	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Historial completo</p>
			</div>

			<FiltrosContenedor>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
					<div className="flex flex-col gap-2">
						<Label
							name="mediciones-limnigrafos-historial"
							text={`Limnígrafos (${filters.limnigrafo.length})`}
						/>
						<MultiSelect
							id="mediciones-limnigrafos-historial"
							options={limnigrafoOptions}
							selectedValues={filters.limnigrafo}
							onChange={onLimnigrafoChange}
							placeholder="Todos"
							className="text-[15px]"
							emptyText="No hay limnígrafos disponibles"
							maxVisibleLabels={2}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label name="mediciones-fuente-historial" text="Fuente" />
						<Selector
							id="mediciones-fuente-historial"
							name="mediciones-fuente-historial"
							value={filters.fuente}
							onChange={(event) => onFuenteChange(event.target.value as FuenteFiltro)}
						>
							<option value="">Todas</option>
							<option value="manual">Manual</option>
							<option value="automatico">Automática</option>
							<option value="import_csv">Importación CSV</option>
							<option value="import_json">Importación JSON</option>
						</Selector>
					</div>

					<div className="flex flex-col gap-2">
						<Label name="mediciones-desde-historial" text="Desde" />
						<TextField
							id="mediciones-desde-historial"
							name="mediciones-desde-historial"
							type="datetime-local"
							value={filters.desde}
							onChange={(event) => onDesdeChange(event.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label name="mediciones-hasta-historial" text="Hasta" />
						<TextField
							id="mediciones-hasta-historial"
							name="mediciones-hasta-historial"
							type="datetime-local"
							value={filters.hasta}
							onChange={(event) => onHastaChange(event.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label name="mediciones-busqueda-historial" text="Buscar" />
						<TextField
							id="mediciones-busqueda-historial"
							name="mediciones-busqueda-historial"
							type="text"
							value={filters.busqueda}
							onChange={(event) => onBusquedaChange(event.target.value)}
							placeholder="ID, limnígrafo o valor"
						/>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap gap-3">
					<BotonVariante
						variant="guardar"
						onClick={onApplyFilters}
					>
						<span>Aplicar filtros</span>
					</BotonVariante>
					<BotonVariante
						variant="default"
						onClick={onClearFilters}
					>
						<span>Limpiar</span>
					</BotonVariante>
					<BotonVariante
						variant="default"
						onClick={() => onExport("csv")}
						disabled={isExporting}
					>
						<span>Exportar CSV</span>
					</BotonVariante>
					<BotonVariante
						variant="default"
						onClick={() => onExport("json")}
						disabled={isExporting}
					>
						<span>Exportar JSON</span>
					</BotonVariante>
				</div>
			</FiltrosContenedor>

			{actionError ? (
				<p className="mb-4 mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
					{actionError}
				</p>
			) : null}
			{actionMessage ? (
				<p className="mb-4 mt-4 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] text-[#166534] dark:border-[#14532D] dark:bg-[#0F2E1A] dark:text-[#86EFAC]">
					{actionMessage}
				</p>
			) : null}

			{hasTopError ? (
				<p className="mb-4 mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
					No se pudieron cargar las mediciones. Verificá la conexión con el backend.
				</p>
			) : null}

			<DataTable
				data={rows}
				columns={tableColumns}
				rowIdKey="id"
				enableRowAnimation={false}
				loadingRows={8}
				isLoading={isLoading}
				paginationConfig={paginationConfig}
				showBottomPagination
				emptyStateContent={<span className="text-[#6B7280] dark:text-[#94A3B8]">No hay mediciones para los filtros seleccionados.</span>}
			/>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
					Mostrando {startRow}-{endRow} de {serverCount}. Página {currentPage} de {totalPages}
					{hasBusqueda ? ` (coincidencias en página: ${rows.length})` : ""}
				</p>
			</div>
		</section>
	);
}
