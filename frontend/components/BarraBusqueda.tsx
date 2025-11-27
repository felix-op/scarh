"use client";

import type { ChangeEvent } from "react";
import { LupaBusqueda } from "./icons/Icons";

type BarraBusquedaProps = {
  valor?: string;
  placeholder?: string;
  onChange?: (valor: string) => void;
  className?: string;
};

export default function BarraBusqueda({
  valor = "",
  placeholder = "Buscar",
  onChange,
  className = "",
}: BarraBusquedaProps) {
  function manejarCambio(evento: ChangeEvent<HTMLInputElement>) {
    onChange?.(evento.target.value);
  }

  return (
    <label
      className={`
        flex
        items-center
        gap-2.5
        rounded-[22px]
        bg-[#F5F5F5]
        px-3
        py-0.5
        shadow-[0px_2px_5px_rgba(0,0,0,0.12)]
        border
        border-[#E0E0E0]
        text-[#8A8A8A]
        w-full
        max-w-[320px]
        ${className}
      `}
    >
      <LupaBusqueda size={22} color="#8A8A8A" />
      <input
        type="search"
        value={valor}
        placeholder={placeholder}
        onChange={manejarCambio}
        className="
          w-full
          bg-transparent
          text-[18px]
          font-light
          text-[#7C7C7C]
          placeholder:text-[#B0B0B0]
          focus:outline-none
        "
      />
    </label>
  );
}
