"use client";

import type { ChangeEvent } from "react";

export type LimnigrafoStatusVariant =
  | "activo"
  | "prueba"
  | "fuera"
  | "advertencia";

export const LIMNIGRAFO_STATUS_STYLES: Record<
  LimnigrafoStatusVariant,
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

type LimnigrafoStatus = {
  etiqueta?: string;
  indicadorColor?: string;
  bordeColor?: string;
  variante?: LimnigrafoStatusVariant;
};

export type LimnigrafoRowData = {
  id: string;
  nombre: string;
  ubicacion: string;
  bateria: string;
  tiempoUltimoDato: string;
  estado: LimnigrafoStatus;
};

type LimnigrafoTableProps = {
  data: LimnigrafoRowData[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
};

const columnTitles = [
  "Estados",
  "Limnigrafo",
  "Ubicación de Limnigrafo",
  "Batería",
  "Tiem. Último Dato",
];

export default function LimnigrafoTable({
  data,
  className = "",
  searchValue = "",
  onSearchChange,
  onFilterClick,
}: LimnigrafoTableProps) {
  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchChange?.(event.target.value);
  }

  return (
    <section
      className={`
        w-full max-w-[1568px]
        rounded-[20px]
        bg-white
        shadow-[1px_6px_12px_rgba(0,0,0,0.25)]
        overflow-hidden
        font-outfit
        ${className}
      `}
    >
      <header className="flex items-center justify-between border-b border-[#6E6F72]/30 px-6 py-4">
        {columnTitles.map((title) => (
          <div
            key={title}
            className="flex-1 text-center text-[24px] font-normal text-[#605E5E]"
          >
            {title}
          </div>
        ))}
      </header>

      <div className="flex items-center gap-4 border-b border-[#D3D4D5] px-6 py-3">
        <div className="flex w-[407px] items-center rounded-[23px] bg-transparent px-2 py-1">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-4 top-1/2 inline-flex h-[27px] w-[27px] -translate-y-1/2 items-center justify-center rounded-full border border-[#85888A] shadow-[0px_4px_4px_rgba(16,15,15,0.25)]" />
            <input
              type="search"
              placeholder="Buscar"
              value={searchValue}
              onChange={handleSearchChange}
              className="
                w-full
                rounded-[10px]
                bg-[#F3F3F3]
                py-2 pl-14 pr-4
                text-center
                text-[16px]
                font-light
                text-[#898989]
                shadow-[3px_4px_4px_rgba(0,0,0,0.19)]
                outline-none
              "
            />
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onFilterClick}
          className="
            inline-flex
            items-center
            gap-3
            rounded-[20px]
            bg-[#F0F0F0]
            px-6
            py-2
            text-[18px]
            font-medium
            text-[#898989]
            shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
          "
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#898989]" />
          Filtro
        </button>
      </div>

      <div className="flex flex-col divide-y divide-[#F0F0F0]">
        {data.map((row) => (
          <LimnigrafoTableRow key={row.id} data={row} />
        ))}
      </div>
    </section>
  );
}

export function LimnigrafoTableRow({ data }: { data: LimnigrafoRowData }) {
  return (
    <div className="grid grid-cols-[200px_repeat(4,minmax(0,1fr))] items-center gap-4 px-6 py-4">
      <EstadoBadge status={data.estado} />
      <div className="text-center text-[24px] font-normal text-black">{data.nombre}</div>
      <div className="text-center text-[24px] font-semibold text-black">{data.ubicacion}</div>
      <div className="text-center text-[24px] font-semibold text-black">{data.bateria}</div>
      <div className="text-center text-[24px] font-semibold text-black">{data.tiempoUltimoDato}</div>
    </div>
  );
}

function EstadoBadge({ status }: { status: LimnigrafoStatus }) {
  const variantData = status.variante
    ? LIMNIGRAFO_STATUS_STYLES[status.variante]
    : undefined;
  const color = status.indicadorColor ?? variantData?.indicadorColor ?? "#1ED760";
  const borderColor = status.bordeColor ?? variantData?.bordeColor ?? "#0F780F69";
  const label = status.etiqueta ?? variantData?.etiqueta ?? "Activo";

  return (
    <div
      className="
        mx-auto
        flex
        w-[197px]
        items-center
        justify-center
        rounded-[40px]
        bg-[#F0F0F0]/90
        px-6
        py-2
        opacity-70
        shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
      "
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.5)]">
          <span
            className="block h-[30px] w-[30px] rounded-full border"
            style={{ backgroundColor: color, borderColor }}
          />
        </span>
        <span className="text-[24px] font-semibold text-black drop-shadow">
          {label}
        </span>
      </div>
    </div>
  );
}
