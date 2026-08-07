"use client";

export type VarianteEstadoLimnigrafo =
  | "activo"
  | "fuera"
  | "peligro"
  | "advertencia";

export const ESTILOS_ESTADO_LIMNIGRAFO: Record<
  VarianteEstadoLimnigrafo,
  { etiqueta: string; indicadorColor: string; bordeColor: string }
> = {
	activo: {
		etiqueta: "Activo",
		indicadorColor: "#1ED760",
		bordeColor: "#0F780F69",
	},
	fuera: {
		etiqueta: "Fuera de rango",
		indicadorColor: "#64748B",
		bordeColor: "#334155",
	},
	peligro: {
		etiqueta: "Peligro",
		indicadorColor: "#FF3B30",
		bordeColor: "#9A1A14",
	},
	advertencia: {
		etiqueta: "Advertencia",
		indicadorColor: "#FF9800",
		bordeColor: "#AD5C00",
	},
};

export type EstadoLimnigrafo = {
  etiqueta?: string;
  indicadorColor?: string;
  bordeColor?: string;
  variante?: VarianteEstadoLimnigrafo;
};

type BotonEstadoProps = {
  estado: EstadoLimnigrafo;
};

export function BotonEstadoLimnigrafo({ estado }: BotonEstadoProps) {
	const datosVariante = estado.variante
		? ESTILOS_ESTADO_LIMNIGRAFO[estado.variante]
		: undefined;
	const color = estado.indicadorColor ?? datosVariante?.indicadorColor ?? "#1ED760";
	const bordeColor = estado.bordeColor ?? datosVariante?.bordeColor ?? "#0F780F69";
	const etiqueta = estado.etiqueta ?? datosVariante?.etiqueta ?? "Activo";

	return (
		<div
			className="
        mx-auto
        flex
        w-fit
        min-w-[128px]
        items-center
        justify-center
        rounded-full
        bg-[#F0F0F0]/90 dark:border dark:border-[#334155] dark:bg-[#1A2433]/95
        px-3
        py-1
        opacity-70 dark:opacity-100
        shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
      "
		>
			<div className="flex items-center gap-2">
				<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.5)] dark:bg-[#1E293B]">
					<span
						className="block h-4 w-4 rounded-full border"
						style={{ backgroundColor: color, borderColor: bordeColor }}
					/>
				</span>
				<span className="text-[14px] font-semibold text-black drop-shadow dark:text-[#E2E8F0]">
					{etiqueta}
				</span>
			</div>
		</div>
	);
}

export default BotonEstadoLimnigrafo;
