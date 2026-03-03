"use client";

export type SeriePoint = {
	label: string;
	value: number;
};

type MedicionLineChartProps = {
	title: string;
	subtitle: string;
	data: SeriePoint[];
	color?: string;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 240;
const PADDING = 24;

function buildPolylinePoints(data: SeriePoint[]): string {
	if (data.length === 0) {
		return "";
	}

	const values = data.map((item) => item.value);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const range = maxValue - minValue || 1;
	const usableWidth = CHART_WIDTH - (PADDING * 2);
	const usableHeight = CHART_HEIGHT - (PADDING * 2);

	return data
		.map((item, index) => {
			const x = PADDING + ((usableWidth * index) / Math.max(1, data.length - 1));
			const normalizedY = (item.value - minValue) / range;
			const y = CHART_HEIGHT - PADDING - (usableHeight * normalizedY);
			return `${x},${y}`;
		})
		.join(" ");
}

export default function MedicionLineChart({
	title,
	subtitle,
	data,
	color = "#0982C8",
}: MedicionLineChartProps) {
	const points = buildPolylinePoints(data);

	return (
		<div className="rounded-[24px] bg-white p-6 shadow-[0px_10px_20px_rgba(0,0,0,0.12)]">
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<p className="text-[15px] font-semibold uppercase tracking-[0.08em] text-[#0982C8]">
						{title}
					</p>
					<p className="text-[14px] text-[#64748B]">{subtitle}</p>
				</div>
			</div>

			{data.length === 0 ? (
				<div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-[#D3D4D5] bg-[#F8FAFC] text-[14px] text-[#6B7280]">
					No hay datos para graficar con los filtros actuales.
				</div>
			) : (
				<div className="overflow-x-auto">
					<svg
						viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
						className="h-[240px] w-full min-w-[680px] rounded-2xl bg-[#F8FAFC]"
						role="img"
						aria-label={`${title} - gráfico de línea`}
					>
						<polyline
							fill="none"
							stroke={color}
							strokeWidth="3"
							strokeLinejoin="round"
							strokeLinecap="round"
							points={points}
						/>
					</svg>
					<div className="mt-2 flex justify-between gap-2 text-[12px] text-[#64748B]">
						<span>{data[0]?.label}</span>
						<span>{data[data.length - 1]?.label}</span>
					</div>
				</div>
			)}
		</div>
	);
}
