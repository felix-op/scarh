export type FilterOption = {
	label: string;
	value: string;
};

export type HistorialFilters = {
	usuario: string;
	accion: string;
	entidad: string;
	desde: string;
	hasta: string;
};

type FilterBarProps = {
	users: FilterOption[];
	actions: FilterOption[];
	entities: FilterOption[];
	values: HistorialFilters;
	onChange: (field: keyof HistorialFilters, value: string) => void;
	onApply: () => void;
	onClear: () => void;
	isLoading?: boolean;
};

export default function FilterBar({
	users,
	actions,
	entities,
	values,
	onChange,
	onApply,
	onClear,
	isLoading = false,
}: FilterBarProps) {
	const fieldClassName = "rounded-xl border border-[#D3D4D5] bg-white p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus:border-[#38BDF8]";

	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
							Filtros del historial
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Usuario
						<select
							className={fieldClassName}
							value={values.usuario}
							onChange={(event) => onChange("usuario", event.target.value)}
						>
							{users.map((user) => (
								<option key={user.value} value={user.value}>
									{user.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Tipo de acción
						<select
							className={fieldClassName}
							value={values.accion}
							onChange={(event) => onChange("accion", event.target.value)}
						>
							{actions.map((action) => (
								<option key={action.value} value={action.value}>
									{action.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Entidad
						<select
							className={fieldClassName}
							value={values.entidad}
							onChange={(event) => onChange("entidad", event.target.value)}
						>
							{entities.map((entity) => (
								<option key={entity.value} value={entity.value}>
									{entity.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Fecha desde
						<input
							type="date"
							className={fieldClassName}
							value={values.desde}
							onChange={(event) => onChange("desde", event.target.value)}
						/>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Fecha hasta
						<input
							type="date"
							className={fieldClassName}
							value={values.hasta}
							onChange={(event) => onChange("hasta", event.target.value)}
						/>
					</label>
				</div>

				<div className="flex flex-wrap items-center gap-3 pt-1">
					<button
						type="button"
						onClick={onApply}
						disabled={isLoading}
						className="rounded-xl bg-[#0982C8] px-5 py-3 text-[15px] font-semibold text-white shadow-[0px_6px_14px_rgba(9,130,200,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0px_10px_20px_rgba(9,130,200,0.35)]"
					>
						{isLoading ? "Filtrando..." : "Filtrar"}
					</button>
					<button
						type="button"
						onClick={onClear}
						className="rounded-xl border border-[#0982C8] bg-white px-5 py-3 text-[15px] font-semibold text-[#0982C8] shadow-[0px_4px_10px_rgba(9,130,200,0.12)] transition hover:-translate-y-[1px] hover:border-[#0A76BB] dark:bg-[#0F172A] dark:text-[#38BDF8] dark:border-[#0EA5E9]"
					>
						Limpiar
					</button>
				</div>
			</div>
		</section>
	);
}
