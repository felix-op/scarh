type MetricaCardProps = {
  title: string;
  value: string;
  detail?: string;
  accent?: string;
};

export default function MetricaCard({
	title,
	value,
	detail,
	accent = "#0982C8",
}: MetricaCardProps) {
	return (
		<div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-[0px_8px_16px_rgba(0,0,0,0.12)] dark:bg-[#111923] dark:shadow-[0px_10px_20px_rgba(0,0,0,0.4)]">
			<div className="flex items-center justify-between">
				<p className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B] dark:text-[#94A3B8]">
					{title}
				</p>
				<div className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
			</div>
			<p className="text-[28px] font-semibold text-[#011018] dark:text-[#E2E8F0]">{value}</p>
			{detail ? (
				<p className="text-[15px] text-[#6B6B6B] dark:text-[#94A3B8]">{detail}</p>
			) : null}
		</div>
	);
}
