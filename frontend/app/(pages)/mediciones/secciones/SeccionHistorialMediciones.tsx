"use client";

import DataTable from "@componentes/tabla/DataTable";
import { ColumnConfig } from "@componentes/tabla/types";
import { LimnigrafoResponse } from "@servicios/api/django.api";
import { FuenteFiltro, HistorialFilters, MedicionRow } from "./types";

const tableColumns: ColumnConfig<MedicionRow>[] = [
	{
		id: "limnigrafo",
		header: "Limnígrafo",
		cell: (row) => <span className="px-4 py-3 font-semibold text-[#011018] dark:text-[#E2E8F0]">{row.limnigrafo}</span>,
	},
	{
		id: "fuente",
		header: "Fuente",
		cell: (row) => (
			<div className="px-4 py-3">
				<span
					className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
						row.fuente === "manual"
							? "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] dark:border-[#A16207] dark:bg-[#422006] dark:text-[#FCD34D]"
							: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF] dark:border-[#1D4ED8] dark:bg-[#0B2A43] dark:text-[#93C5FD]"
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
	onLimnigrafoChange: (value: string) => void;
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
	isFetching: boolean;
	hasBusqueda: boolean;
	onPrevPage: () => void;
	onNextPage: () => void;
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
	isFetching,
	hasBusqueda,
	onPrevPage,
	onNextPage,
}: SeccionHistorialMedicionesProps) {
	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Historial completo</p>
				<span className="rounded-full bg-[#F1F5F9] px-4 py-1 text-[13px] font-semibold text-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]">
					{isLoading ? "Cargando..." : `${serverCount} registros`}
				</span>
			</div>

			<div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#334155] dark:bg-[#111923]">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
					<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Limnígrafo
						<select
							value={filters.limnigrafo}
							onChange={(event) => onLimnigrafoChange(event.target.value)}
							className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
						>
							<option value="">Todos</option>
							{limnigrafos.map((limnigrafo) => (
								<option key={limnigrafo.id} value={String(limnigrafo.id)}>
									{limnigrafo.codigo}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Fuente
						<select
							value={filters.fuente}
							onChange={(event) => onFuenteChange(event.target.value as FuenteFiltro)}
							className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
						>
							<option value="">Todas</option>
							<option value="manual">Manual</option>
							<option value="automatico">Automática</option>
						</select>
					</label>

					<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Desde
						<input
							type="datetime-local"
							value={filters.desde}
							onChange={(event) => onDesdeChange(event.target.value)}
							className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
						/>
					</label>

					<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Hasta
						<input
							type="datetime-local"
							value={filters.hasta}
							onChange={(event) => onHastaChange(event.target.value)}
							className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
						/>
					</label>

					<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Buscar
						<input
							type="text"
							value={filters.busqueda}
							onChange={(event) => onBusquedaChange(event.target.value)}
							placeholder="ID, limnígrafo o valor"
							className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
						/>
					</label>
				</div>

				<div className="mt-4 flex flex-wrap gap-3">
					<button
						type="button"
						onClick={onApplyFilters}
						className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)] dark:bg-[#0369A1] dark:shadow-[0px_4px_12px_rgba(2,132,199,0.4)]"
					>
						Aplicar filtros de historial
					</button>
					<button
						type="button"
						onClick={onClearFilters}
						className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
					>
						Limpiar
					</button>
					<button
						type="button"
						onClick={() => onExport("csv")}
						disabled={isExporting}
						className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50 dark:border-[#2563EB] dark:bg-[#0B2A43] dark:text-[#93C5FD]"
					>
						Exportar CSV
					</button>
					<button
						type="button"
						onClick={() => onExport("json")}
						disabled={isExporting}
						className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50 dark:border-[#2563EB] dark:bg-[#0B2A43] dark:text-[#93C5FD]"
					>
						Exportar JSON
					</button>
				</div>
			</div>

			{hasTopError ? (
				<p className="mb-4 mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[14px] text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#3A1818] dark:text-[#FECACA]">
					No se pudieron cargar las mediciones. Verificá la conexión con el backend.
				</p>
			) : null}

			<DataTable
				data={rows}
				columns={tableColumns}
				rowIdKey="id"
				showTopBar={false}
				enableRowAnimation={false}
				loadingRows={8}
				isLoading={isLoading}
				emptyStateContent={<span className="text-[#6B7280] dark:text-[#94A3B8]">No hay mediciones para los filtros seleccionados.</span>}
				styles={{
					cardClassName: "rounded-[20px] border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)] dark:border-[#334155] dark:bg-[#0F172A] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.45)]",
					scrollerClassName: "overflow-x-auto",
					tableClassName: "min-w-full text-left text-[14px] text-[#2F2F2F] dark:text-[#CBD5E1]",
					theadClassName: "bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B] border-none dark:bg-[#111923] dark:text-[#94A3B8]",
					headerCellClassName: "px-4 py-3",
					tbodyClassName: "divide-y divide-[#EAEAEA] dark:divide-[#334155]",
					rowClassName: "border-0 hover:bg-[#F9FBFF] dark:hover:bg-[#1E293B]",
					cellClassName: "align-middle",
					emptyCellClassName: "px-4 py-8",
				}}
			/>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
					Mostrando {startRow}-{endRow} de {serverCount}. Página {currentPage} de {totalPages}
					{hasBusqueda ? ` (coincidencias en página: ${rows.length})` : ""}
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onPrevPage}
						disabled={currentPage <= 1 || isFetching}
						className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
					>
						Anterior
					</button>
					<button
						type="button"
						onClick={onNextPage}
						disabled={currentPage >= totalPages || isFetching}
						className="rounded-xl border border-[#CBD5E1] px-4 py-2 text-[14px] font-semibold text-[#334155] disabled:opacity-40 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]"
					>
						Siguiente
					</button>
				</div>
			</div>
		</section>
	);
}
