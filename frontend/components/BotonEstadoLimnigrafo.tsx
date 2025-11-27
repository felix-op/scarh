"use client";

export type VarianteEstadoLimnigrafo =
  | "activo"
  | "prueba"
  | "fuera"
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
  prueba: {
    etiqueta: "Prueba",
    indicadorColor: "#FFEB0C",
    bordeColor: "#ABB800",
  },
  fuera: {
    etiqueta: "Fuera",
    indicadorColor: "#FF0C0C",
    bordeColor: "#791010",
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
        w-[170px]
        items-center
        justify-center
        rounded-[36px]
        bg-[#F0F0F0]/90
        px-5
        py-1.5
        opacity-70
        shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
      "
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.5)]">
          <span
            className="block h-[24px] w-[24px] rounded-full border"
            style={{ backgroundColor: color, borderColor: bordeColor }}
          />
        </span>
        <span className="text-[20px] font-semibold text-black drop-shadow">
          {etiqueta}
        </span>
      </div>
    </div>
  );
}

export default BotonEstadoLimnigrafo;
