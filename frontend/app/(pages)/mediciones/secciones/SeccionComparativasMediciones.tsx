"use client";

import {
	EstadisticaAtributo,
	EstadisticaOutputItem,
	LimnigrafoResponse,
} from "@servicios/api/django.api";
import { ComparativasFilters } from "./types";

function formatNumber(value: number, decimals = 2): string {
	if (Number.isNaN(value)) {
		return "-";
	}
	return value.toLocaleString("es-AR", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
}

type SeccionComparativasMedicionesProps = {
	filters: ComparativasFilters;
	onDesdeChange: (value: string) => void;
	onHastaChange: (value: string) => void;
	onAtributoChange: (value: EstadisticaAtributo) => void;
	onApplyFilters: () => void;
	onClearFilters: () => void;
	onCalcular: () => void;
	isCalculando: boolean;
	compareSearch: string;
	onCompareSearchChange: (value: string) => void;
	onSelectAll: () => void;
	onSelectVisible: () => void;
	onClearSelection: () => void;
	onToggleSelection: (limnigrafoId: string, checked: boolean) => void;
	limnigrafosTotales: number;
	filteredLimnigrafos: LimnigrafoResponse[];
	compareIds: string[];
	estadisticasError: string | null;
	estadisticas: EstadisticaOutputItem[];
	limnigrafoNameById: Map<number, string>;
};

export default function SeccionComparativasMediciones({
	filters,
	onDesdeChange,
	onHastaChange,
	onAtributoChange,
	onApplyFilters,
	onClearFilters,
	onCalcular,
	isCalculando,
	compareSearch,
	onCompareSearchChange,
	onSelectAll,
	onSelectVisible,
	onClearSelection,
	onToggleSelection,
	limnigrafosTotales,
	filteredLimnigrafos,
	compareIds,
	estadisticasError,
	estadisticas,
	limnigrafoNameById,
}: SeccionComparativasMedicionesProps) {
	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">Comparativas</p>
					</div>
					<button
						type="button"
						onClick={onCalcular}
						disabled={isCalculando}
						className="rounded-xl border border-[#0EA5E9] bg-[#E0F2FE] px-5 py-3 text-[14px] font-semibold text-[#0369A1] disabled:opacity-50"
					>
						{isCalculando ? "Calculando..." : "Calcular estadísticas"}
					</button>
				</div>

				<div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
							Desde
							<input
								type="datetime-local"
								value={filters.desde}
								onChange={(event) => onDesdeChange(event.target.value)}
								className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
							Hasta
							<input
								type="datetime-local"
								value={filters.hasta}
								onChange={(event) => onHastaChange(event.target.value)}
								className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none focus:border-[#0982C8]"
							/>
						</label>

						<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#4B4B4B]">
							Atributo
							<select
								value={filters.atributo}
								onChange={(event) => onAtributoChange(event.target.value as EstadisticaAtributo)}
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
							onClick={onApplyFilters}
							className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)]"
						>
							Aplicar filtros de comparativas
						</button>
						<button
							type="button"
							onClick={onClearFilters}
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
								onChange={(event) => onCompareSearchChange(event.target.value)}
								placeholder="Buscar ..."
								className="rounded-xl border border-[#D3D4D5] bg-white px-3 py-2 text-[14px] text-[#334155] outline-none focus:border-[#0982C8]"
							/>
						</div>

						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={onSelectAll}
								disabled={limnigrafosTotales === 0}
								className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[13px] font-semibold text-[#1D4ED8] disabled:opacity-50"
							>
								Seleccionar todos
							</button>
							<button
								type="button"
								onClick={onSelectVisible}
								disabled={filteredLimnigrafos.length === 0}
								className="rounded-lg border border-[#BAE6FD] bg-[#ECFEFF] px-3 py-2 text-[13px] font-semibold text-[#0369A1] disabled:opacity-50"
							>
								Seleccionar visibles
							</button>
							<button
								type="button"
								onClick={onClearSelection}
								disabled={compareIds.length === 0}
								className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[13px] font-semibold text-[#475569] disabled:opacity-50"
							>
								Limpiar selección
							</button>
						</div>
					</div>

					<p className="mt-3 text-[13px] text-[#64748B]">
						Seleccionados: {compareIds.length} de {limnigrafosTotales}
						{compareSearch.trim() ? ` • Visibles: ${filteredLimnigrafos.length}` : ""}
					</p>

					<div className="mt-3 max-h-[220px] overflow-auto rounded-xl border border-[#E2E8F0] bg-white p-2">
						{filteredLimnigrafos.length === 0 ? (
							<p className="px-2 py-3 text-[13px] text-[#64748B]">No hay limnígrafos para ese filtro.</p>
						) : (
							<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
								{filteredLimnigrafos.map((limnigrafo) => {
									const isChecked = compareIds.includes(String(limnigrafo.id));
									return (
										<label key={limnigrafo.id} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[14px] text-[#334155]">
											<input
												type="checkbox"
												checked={isChecked}
												onChange={(event) => onToggleSelection(String(limnigrafo.id), event.target.checked)}
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
	);
}
