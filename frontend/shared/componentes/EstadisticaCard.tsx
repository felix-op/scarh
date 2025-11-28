type EstadisticaCardProps = {
  title: string;
  value: string;
  detail?: string;
  accent?: string;
};

export default function EstadisticaCard({
	title,
	value,
	detail,
	accent = "#0982C8",
}: EstadisticaCardProps) {
	return (
		<div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-[0px_8px_16px_rgba(0,0,0,0.12)]">
			<div className="flex items-center justify-between">
				<p className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B]">
					{title}
				</p>
				<div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
			</div>
			<p className="text-[28px] font-semibold text-[#011018]">{value}</p>
			{detail ? (
				<p className="text-[15px] text-[#6B6B6B]">{detail}</p>
			) : null}
		</div>
	);
}
