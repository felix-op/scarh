import BotonVariante from "@componentes/botones/BotonVariante";
import Selector from "@componentes/campos/Selector";
import TextField from "@componentes/campos/TextField";

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
	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)] dark:bg-[#1B1F25] dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]">
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Usuario
						<Selector
							id="historial-usuario"
							name="historial-usuario"
							value={values.usuario}
							onChange={(event) => onChange("usuario", event.target.value)}
						>
							{users.map((user) => (
								<option key={user.value} value={user.value}>
									{user.label}
								</option>
							))}
						</Selector>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Tipo de acción
						<Selector
							id="historial-accion"
							name="historial-accion"
							value={values.accion}
							onChange={(event) => onChange("accion", event.target.value)}
						>
							{actions.map((action) => (
								<option key={action.value} value={action.value}>
									{action.label}
								</option>
							))}
						</Selector>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Entidad
						<Selector
							id="historial-entidad"
							name="historial-entidad"
							value={values.entidad}
							onChange={(event) => onChange("entidad", event.target.value)}
						>
							{entities.map((entity) => (
								<option key={entity.value} value={entity.value}>
									{entity.label}
								</option>
							))}
						</Selector>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Fecha desde
						<TextField
							id="historial-desde"
							name="historial-desde"
							type="date"
							value={values.desde}
							onChange={(event) => onChange("desde", event.target.value)}
						/>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B] dark:text-[#CBD5E1]">
						Fecha hasta
						<TextField
							id="historial-hasta"
							name="historial-hasta"
							type="date"
							value={values.hasta}
							onChange={(event) => onChange("hasta", event.target.value)}
						/>
					</label>
				</div>

				<div className="flex flex-wrap items-center gap-3 pt-1">
					<BotonVariante
						type="button"
						variant="guardar"
						onClick={onApply}
						disabled={isLoading}
					>
						<span>{isLoading ? "Filtrando..." : "Aplicar filtros"}</span>
					</BotonVariante>
					<BotonVariante
						type="button"
						variant="default"
						onClick={onClear}
					>
						<span>Limpiar</span>
					</BotonVariante>
				</div>
			</div>
		</section>
	);
}
