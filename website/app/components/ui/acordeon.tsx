"use client";

import type { ReactNode } from "react";
import { IconifyIcon } from "./iconify-icon";

/**
 * Contenedor desplegable controlado.
 * @property {ReactNode} titulo Contenido visible del encabezado.
 * @property {boolean} abierto Indica si el contenido está desplegado.
 * @property {(abierto: boolean) => void} onAbiertoChange Notifica la intención de abrir o cerrar.
 * @property {ReactNode} children Contenido desplegable.
 * @property {string} [className] Clases adicionales para el contenedor.
 * @property {string} [encabezadoClassName] Clases adicionales para el encabezado.
 * @property {string} [contenidoClassName] Clases adicionales para el contenido.
 */
export interface AcordeonProps {
  titulo: ReactNode;
  abierto: boolean;
  onAbiertoChange: (_abierto: boolean) => void;
  children: ReactNode;
  className?: string;
  encabezadoClassName?: string;
  contenidoClassName?: string;
}

export function Acordeon({
  titulo,
  abierto,
  onAbiertoChange,
  children,
  className = "",
  encabezadoClassName = "",
  contenidoClassName = "",
}: AcordeonProps) {
  return (
    <section className={`overflow-hidden rounded-shape-lg border border-border bg-background-paper ${className}`}>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => onAbiertoChange(!abierto)}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-hover ${encabezadoClassName}`}
      >
        <span className="text-xl font-semibold text-foreground-title">{titulo}</span>
        <IconifyIcon
          variant={abierto ? "chevronDown" : "chevronUp"}
          className="shrink-0 text-xl text-foreground-secondary"
        />
      </button>
      <div
        aria-hidden={!abierto}
        inert={!abierto}
        className={`grid min-h-0 transition-[grid-template-rows] duration-300 ease-in-out ${
          abierto ? "flex-1 grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="h-full min-h-0 overflow-hidden">
          <div className={`h-full ${contenidoClassName}`}>{children}</div>
        </div>
      </div>
    </section>
  );
}
