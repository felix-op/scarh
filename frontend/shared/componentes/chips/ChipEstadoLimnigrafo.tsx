import type { EstadoLimnigrafo as EstadoLimnigrafoVisual } from "@componentes/BotonEstadoLimnigrafo";
import type { EstadoLimnigrafo as EstadoLimnigrafoBackend } from "types/limnigrafos";

type ChipEstadoLimnigrafoProps = {
	estado: EstadoLimnigrafoBackend | EstadoLimnigrafoVisual,
}

export const ESTILOS_ESTADO_LIMNIGRAFO = {
	normal: {
		etiqueta: "Activo",
		backgroundColor: "#22C55E",
		borderColor: "#0D7A3A",
		lightClassName: "border-[#D9E0E7] bg-[#EEF2F6] text-[#202938] shadow-[0px_3px_10px_rgba(15,23,42,0.08)]",
		darkClassName: "dark:border-[#304766] dark:bg-[#1B2639] dark:text-[#E5E7EB] dark:shadow-[0px_5px_12px_rgba(0,0,0,0.18)]",
	},
	fuera: {
		etiqueta: "Fuera de rango",
		backgroundColor: "#475569",
		borderColor: "#334155",
		lightClassName: "border-[#D9E0E7] bg-[#ECEFF3] text-[#202938] shadow-[0px_3px_10px_rgba(15,23,42,0.08)]",
		darkClassName: "dark:border-[#304766] dark:bg-[#1B2639] dark:text-[#E5E7EB] dark:shadow-[0px_5px_12px_rgba(0,0,0,0.18)]",
	},
	peligro: {
		etiqueta: "Peligro",
		backgroundColor: "#EF4444",
		borderColor: "#991B1B",
		lightClassName: "border-[#D9E0E7] bg-[#F2EDEE] text-[#202938] shadow-[0px_3px_10px_rgba(15,23,42,0.08)]",
		darkClassName: "dark:border-[#6F2A32] dark:bg-[#3A1820] dark:text-[#FFE3E3] dark:shadow-[0px_5px_12px_rgba(0,0,0,0.18)]",
	},
	advertencia: {
		etiqueta: "Advertencia",
		backgroundColor: "#F97316",
		borderColor: "#C2410C",
		lightClassName: "border-[#D9E0E7] bg-[#F4EFEB] text-[#202938] shadow-[0px_3px_10px_rgba(15,23,42,0.08)]",
		darkClassName: "dark:border-[#7A4318] dark:bg-[#3E2512] dark:text-[#FFE8D6] dark:shadow-[0px_5px_12px_rgba(0,0,0,0.18)]",
	},
};

export default function ChipEstadoLimnigrafo({ estado }: ChipEstadoLimnigrafoProps) {
	const varianteBase =
		typeof estado === "string"
			? estado
			: estado.variante ?? "normal";
	const variante =
		varianteBase === "activo"
			? "normal"
			: varianteBase === "fuera_de_rango" || varianteBase === "fuera_de_servicio"
				? "fuera"
				: varianteBase;
	const config = ESTILOS_ESTADO_LIMNIGRAFO[variante] ?? ESTILOS_ESTADO_LIMNIGRAFO.normal;

	return (
		<div
			className={`flex min-w-[156px] items-center gap-2.5 rounded-full border px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${config.lightClassName} ${config.darkClassName}`}
		>
			<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_0px_0px_1px_rgba(148,163,184,0.18),0px_2px_6px_rgba(15,23,42,0.12)] dark:bg-[#223149] dark:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.05),0px_3px_8px_rgba(0,0,0,0.24)]">
				<span
					className="block h-5 w-5 rounded-full border shadow-[0px_0px_8px_rgba(0,0,0,0.22)]"
					style={{ backgroundColor: config.backgroundColor, borderColor: config.borderColor }}
				/>
			</span>
			<span className="text-[14px] font-semibold leading-none">
				{config.etiqueta}
			</span>
		</div>
	);
}
