"use client";

import { Children, useState, type ReactNode } from "react";
import { BotonIcono } from "./botones";

export interface CarruselProps {
  children: ReactNode;
  /** Cantidad de elementos que muestra cada página. */
  elementosPorPagina?: number;
  className?: string;
  classNamePagina?: string;
  ariaLabel?: string;
  /** Superpone los controles sobre los bordes del contenido. */
  controlesFlotantes?: boolean;
}

/** Carrusel paginado para colecciones pequeñas, con controles accesibles a ambos lados. */
export function Carrusel({
  children,
  elementosPorPagina = 1,
  className = "",
  classNamePagina = "",
  ariaLabel = "Carrusel",
  controlesFlotantes = false,
}: CarruselProps) {
  const elementos = Children.toArray(children);
  const paginas = Array.from({ length: Math.ceil(elementos.length / elementosPorPagina) }, (_, indice) =>
    elementos.slice(indice * elementosPorPagina, (indice + 1) * elementosPorPagina),
  );
  const [pagina, setPagina] = useState(0);
  const [direccion, setDireccion] = useState<"anterior" | "siguiente">("siguiente");

  if (elementos.length === 0) return null;

  const tieneMultiplesPaginas = paginas.length > 1;
  const paginaVisible = Math.min(pagina, paginas.length - 1);
  const cambiarPagina = (siguiente: number) => {
    setDireccion(siguiente > paginaVisible ? "siguiente" : "anterior");
    setPagina(siguiente);
  };

  return (
    <section aria-label={ariaLabel} className={`relative flex min-h-0 ${controlesFlotantes ? "" : "items-center gap-2"} ${className}`.trim()}>
      <BotonIcono
        icon="chevronLeft"
        aria-label="Página anterior"
        disabled={!tieneMultiplesPaginas || paginaVisible === 0}
        onClick={() => cambiarPagina(Math.max(paginaVisible - 1, 0))}
        className={controlesFlotantes ? "absolute -left-5 top-1/2 z-10 -translate-y-1/2 rounded-shape-full border border-border bg-background-paper shadow-md" : ""}
      />
      <div
        key={paginaVisible}
        className={`${controlesFlotantes ? "w-full" : "min-w-0 flex-1"} motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 ${
          direccion === "siguiente" ? "motion-safe:slide-in-from-right-2" : "motion-safe:slide-in-from-left-2"
        } ${classNamePagina}`.trim()}
      >
        {paginas[paginaVisible]}
      </div>
      <BotonIcono
        icon="chevronRight"
        aria-label="Página siguiente"
        disabled={!tieneMultiplesPaginas || paginaVisible === paginas.length - 1}
        onClick={() => cambiarPagina(Math.min(paginaVisible + 1, paginas.length - 1))}
        className={controlesFlotantes ? "absolute -right-5 top-1/2 z-10 -translate-y-1/2 rounded-shape-full border border-border bg-background-paper shadow-md" : ""}
      />
    </section>
  );
}

export default Carrusel;
