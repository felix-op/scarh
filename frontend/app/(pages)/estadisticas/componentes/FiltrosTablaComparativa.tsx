"use client";

import MultiSelect, { type MultiSelectOption } from "@componentes/components/ui/multi-select";
import { type Dispatch, type SetStateAction } from "react";
import {
	type EstadisticaAtributo,
	type TablaComparativaFilters,
} from "../lib/estadisticas-domain";

const ALL_LIMNIGRAFOS_VALUE = "__all__";

type FiltrosTablaComparativaProps = {
	filters: TablaComparativaFilters;
	limnigrafoOptions: MultiSelectOption[];
	setFilters: Dispatch<SetStateAction<TablaComparativaFilters>>;
	onApply: () => void;
	onReset: () => void;
};

export default function FiltrosTablaComparativa({
	filters,
	limnigrafoOptions,
	setFilters,
	onApply,
	onReset,
}: FiltrosTablaComparativaProps) {
	const optionsWithAll: MultiSelectOption[] = [
		{ value: ALL_LIMNIGRAFOS_VALUE, label: "Todos" },
		...limnigrafoOptions,
	];
	const selectedLimnigrafoValues = filters.limnigrafos.length > 0
		? filters.limnigrafos
		: [ALL_LIMNIGRAFOS_VALUE];
	const limnigrafoLabelText = filters.limnigrafos.length > 0
		? `Limnígrafos (${filters.limnigrafos.length})`
		: "Limnígrafos (todos)";

	function handleLimnigrafoChange(values: string[]) {
		if (values.includes(ALL_LIMNIGRAFOS_VALUE)) {
			if (filters.limnigrafos.length === 0 && values.length > 1) {
				setFilters((previous) => ({
					...previous,
					limnigrafos: values.filter((value) => value !== ALL_LIMNIGRAFOS_VALUE),
				}));
				return;
			}

			setFilters((previous) => ({ ...previous, limnigrafos: [] }));
			return;
		}

		setFilters((previous) => ({ ...previous, limnigrafos: values }));
	}

	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
					Variable
					<select
						value={filters.atributo}
						onChange={(event) => setFilters((previous) => ({
							...previous,
							atributo: event.target.value as EstadisticaAtributo,
						}))}
						className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
					>
						<option value="altura_agua">Nivel del agua</option>
						<option value="presion">Presión atmosférica</option>
						<option value="temperatura">Temperatura</option>
					</select>
				</label>

				<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
					Fecha desde
					<input
						type="datetime-local"
						value={filters.desde}
						onChange={(event) => setFilters((previous) => ({ ...previous, desde: event.target.value }))}
						className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
					/>
				</label>

				<label className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
					Fecha hasta
					<input
						type="datetime-local"
						value={filters.hasta}
						onChange={(event) => setFilters((previous) => ({ ...previous, hasta: event.target.value }))}
						className="rounded-xl border border-[#D3D4D5] bg-white p-3 text-[14px] text-[#334155] outline-none focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]"
					/>
				</label>

				<div className="flex flex-col gap-2 text-[14px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
					<label htmlFor="estadisticas-tabla-limnigrafos-trigger">
						{limnigrafoLabelText}
					</label>
					<MultiSelect
						id="estadisticas-tabla-limnigrafos-trigger"
						options={optionsWithAll}
						selectedValues={selectedLimnigrafoValues}
						onChange={handleLimnigrafoChange}
						placeholder="Todos"
						className="h-11 text-[13px]"
						emptyText="No hay limnígrafos disponibles"
					/>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={onApply}
						className="rounded-xl bg-[#0982C8] px-5 py-3 text-[14px] font-semibold text-white shadow-[0px_4px_10px_rgba(9,130,200,0.35)] hover:bg-[#0873B2]"
					>
						Aplicar filtros
					</button>
					<button
						type="button"
						onClick={onReset}
						className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-[14px] font-semibold text-[#334155] shadow-[0px_4px_10px_rgba(15,23,42,0.08)] hover:bg-[#F8FAFC]"
					>
						Restablecer
					</button>
				</div>
			</div>
		</section>
	);
}
