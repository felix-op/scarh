export type HistoryRow = {
	id: string;
	usuario: string;
	accion: string;
	entidad: string;
	descripcion: string;
	fechaHora: string;
	registroId: string;
	estado: string;
};

type HistoryTableProps = {
	rows: HistoryRow[];
	className?: string;
	emptyMessage?: string;
};

const estadoStyles: Record<string, string> = {
	Exitoso: "bg-[#E7F6EE] text-[#1E8E3E] border-[#B6E3C6]",
	Fallido: "bg-[#FDECEC] text-[#B42318] border-[#F2B8B5]",
	"En revisión": "bg-[#FFF4E5] text-[#B15C04] border-[#F8D3A3]",
};

export default function HistoryTable({
	rows,
	className = "",
	emptyMessage = "No hay acciones registradas con los filtros seleccionados.",
}: HistoryTableProps) {
	return (
		<div
			className={`overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-[0px_8px_16px_rgba(0,0,0,0.08)] ${className}`}
		>
			<table className="min-w-full text-left text-[14px] text-[#2F2F2F]">
				<thead className="bg-[#F7F9FB] text-[13px] uppercase tracking-wide text-[#6B6B6B]">
					<tr>
						<th className="px-4 py-3">Usuario</th>
						<th className="px-4 py-3">Acción realizada</th>
						<th className="px-4 py-3">Entidad afectada</th>
						<th className="px-4 py-3">Descripción</th>
						<th className="px-4 py-3">Fecha y hora</th>
						<th className="px-4 py-3">ID del registro</th>
						<th className="px-4 py-3">Estado</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[#EAEAEA]">
					{rows.length === 0 ? (
						<tr>
							<td className="px-4 py-8 text-center text-[#6B7280]" colSpan={7}>
								{emptyMessage}
							</td>
						</tr>
					) : (
						rows.map((row) => (
							<tr key={row.id} className="hover:bg-[#F9FBFF]">
								<td className="px-4 py-3 font-semibold text-[#011018]">{row.usuario}</td>
								<td className="px-4 py-3">{row.accion}</td>
								<td className="px-4 py-3 text-[#0982C8]">{row.entidad}</td>
								<td className="px-4 py-3 text-[#4B4B4B]">{row.descripcion}</td>
								<td className="px-4 py-3 text-[#4B4B4B]">{row.fechaHora}</td>
								<td className="px-4 py-3 text-[#6B6B6B]">{row.registroId}</td>
								<td className="px-4 py-3">
									<span
										className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold ${estadoStyles[row.estado] ?? "bg-[#EEF2F7] text-[#374151] border-[#D1D5DB]"}`}
									>
										<span className="h-2 w-2 rounded-full bg-current" />
										{row.estado}
									</span>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}
