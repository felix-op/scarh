type ContenedorGraficoProps = {
  title: string;
  subtitle?: string;
  heightClass?: string;
};

export default function ContenedorGrafico({
	title,
	subtitle,
	heightClass = "h-[260px]",
}: ContenedorGraficoProps) {
	return (
		<div className={`flex flex-col justify-between rounded-2xl bg-white p-4 shadow-[0px_8px_16px_rgba(0,0,0,0.12)] ${heightClass}`}>
			<div>
				<p className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#6B6B6B]">
					{title}
				</p>
				{subtitle ? (
					<p className="text-[14px] text-[#8A8A8A]">{subtitle}</p>
				) : null}
			</div>
			<div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#D3D4D5] bg-[#F7F9FB] text-[14px] font-medium text-[#8A8A8A]">
				Gráfico no implementado
			</div>
		</div>
	);
}
