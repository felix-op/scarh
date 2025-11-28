type HistoryCardProps = {
  actionsToday: number;
  lastAction: string;
  lastUser: string;
  lastTimestamp: string;
  pendingReviews?: number;
};

export default function HistoryCard({
	actionsToday,
	lastAction,
	lastUser,
	lastTimestamp,
	pendingReviews = 0,
}: HistoryCardProps) {
	return (
		<div className="flex flex-col gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.1)]">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
						Resúmen Historial
					</p>
				</div>
			</div>

			<div className="rounded-[16px] bg-gradient-to-r from-[#0B8BD4] to-[#0E7AB8] p-4 text-white shadow-[0px_10px_20px_rgba(9,130,200,0.35)]">
				<p className="text-[14px] uppercase tracking-[0.08em] text-white/80">Acciones de hoy</p>
				<p className="text-4xl font-semibold leading-tight">{actionsToday}</p>
				<p className="text-[15px] text-white/85">Registros en el sistema</p>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				<div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFD] p-4">
					<p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">
						Última acción registrada
					</p>
					<p className="pt-1 text-[16px] font-semibold text-[#011018]">{lastAction}</p>
					<p className="text-[14px] text-[#4B4B4B]">
						Por <span className="font-semibold text-[#0982C8]">{lastUser}</span>
					</p>
					<p className="text-[13px] text-[#6B6B6B]">{lastTimestamp}</p>
				</div>

				<div className="rounded-xl border border-[#E5E7EB] bg-[#FDF7EC] p-4">
					<p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#B15C04]">
						Alertas pendientes
					</p>
					<p className="pt-1 text-3xl font-semibold text-[#B15C04]">{pendingReviews}</p>
				</div>
			</div>
		</div>
	);
}
