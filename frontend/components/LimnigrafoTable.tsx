"use client";

import BarraBusqueda from "./BarraBusqueda";
import Boton from "./Boton";
import RenglonDatos, { type CeldaRenglonDatos } from "./RenglonDatos";
import {
  BotonEstadoLimnigrafo,
  type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";
import { FiltroDeslizadores } from "./icons/Icons";

export type LimnigrafoRowData = {
  id: string;
  nombre: string;
  ubicacion: string;
  bateria: string;
  tiempoUltimoDato: string;
  estado: EstadoLimnigrafo;
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
  function handleSearchChange(valor: string) {
    onSearchChange?.(valor);
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
      <header className="flex items-center justify-between border-b border-[#6E6F72]/30 px-6 py-3">
        {columnTitles.map((title) => (
          <div
            key={title}
            className="flex-1 text-center text-[20px] font-medium text-[#605E5E]"
          >
            {title}
          </div>
        ))}
      </header>

      <div className="flex items-center gap-2 border-b border-[#D3D4D5] px-3 py-1">
        <BarraBusqueda
          valor={searchValue}
          onChange={handleSearchChange}
          className="max-w-[320px]"
        />

        <div className="flex-1" />

        <Boton
          type="button"
          onClick={onFilterClick}
          className="
            !mx-0
            gap-2
            !bg-[#F3F3F3]
            !text-[#7F7F7F]
            !rounded-[24px]
            !h-[34px]
            !px-[14px]
            shadow-[0px_2px_6px_rgba(0,0,0,0.12)]
            border
            border-[#E0E0E0]
          "
        >
          <FiltroDeslizadores size={18} color="#7F7F7F" />
          <span className="text-[15px] font-medium">Filtro</span>
        </Boton>
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
  const celdas: CeldaRenglonDatos[] = [
    { contenido: <BotonEstadoLimnigrafo estado={data.estado} /> },
    { contenido: data.nombre, clase: "font-normal" },
    { contenido: data.ubicacion },
    { contenido: data.bateria },
    { contenido: data.tiempoUltimoDato },
  ];

  return (
    <RenglonDatos
      celdas={celdas}
      plantillaColumnas="200px repeat(4, minmax(0, 1fr))"
      claseBaseCelda="text-[18px] font-semibold text-black"
    />
  );
}
