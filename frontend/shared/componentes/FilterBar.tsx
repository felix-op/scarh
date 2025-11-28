type FilterBarProps = {
  users: string[];
  actions: string[];
  entities: string[];
};

export default function FilterBar({ users, actions, entities }: FilterBarProps) {
	return (
		<section className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
							Filtros del historial
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
						Usuario
						<select className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8]">
							{users.map((user) => (
								<option key={user}>{user}</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
						Tipo de acción
						<select className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8]">
							{actions.map((action) => (
								<option key={action}>{action}</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
						Entidad
						<select className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8]">
							{entities.map((entity) => (
								<option key={entity}>{entity}</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
						Fecha desde
						<input
							type="date"
							className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8]"
							value=""
							onChange={() => {}}
						/>
					</label>
					<label className="flex flex-col gap-2 text-[15px] font-semibold text-[#4B4B4B]">
						Fecha hasta
						<input
							type="date"
							className="rounded-xl border border-[#D3D4D5] p-3 text-[15px] text-[#4B4B4B] outline-none transition focus:border-[#0982C8]"
							value=""
							onChange={() => {}}
						/>
					</label>
				</div>

				<div className="flex flex-wrap items-center gap-3 pt-1">
					<button
						type="button"
						className="rounded-xl bg-[#0982C8] px-5 py-3 text-[15px] font-semibold text-white shadow-[0px_6px_14px_rgba(9,130,200,0.35)] transition hover:-translate-y-[1px] hover:shadow-[0px_10px_20px_rgba(9,130,200,0.35)]"
					>
						Filtrar
					</button>
					<button
						type="button"
						className="rounded-xl border border-[#0982C8] px-5 py-3 text-[15px] font-semibold text-[#0982C8] bg-white shadow-[0px_4px_10px_rgba(9,130,200,0.12)] transition hover:-translate-y-[1px] hover:border-[#0A76BB]"
					>
						Limpiar
					</button>
				</div>
			</div>
		</section>
	);
}
