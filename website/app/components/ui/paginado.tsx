"use client";

import { BotonIcono } from "./botones";
import { Select } from "./select";

/**
 * Configuración del componente de paginación.
 * @property {number} page Página actual (1-indexed).
 * @property {number} maxPage Cantidad total de páginas.
 * @property {number} totalRows Total de filas en el dataset.
 * @property {() => void} onPrev Callback para ir a la página anterior.
 * @property {() => void} onNext Callback para ir a la página siguiente.
 * @property {number} pageLength Cantidad de filas por página actualmente seleccionada.
 * @property {number[]} pageLengthOptions Opciones disponibles de filas por página.
 * @property {(length: number) => void} onChangePageLength Callback al cambiar filas por página.
 */
export interface PaginationConfig {
  page: number;
  maxPage: number;
  totalRows: number;
  onPrev: () => void;
  onNext: () => void;
  pageLength: number;
  pageLengthOptions: number[];
  onChangePageLength: (length: number) => void;
}

export interface PaginadoProps {
  config: PaginationConfig;
  /** Sufijo para el `name` del Select, evita colisión si se renderiza arriba y abajo a la vez. */
  idSuffix?: string;
  className?: string;
}

export function Paginado({ config, idSuffix = "", className = "" }: PaginadoProps) {
  const { page, maxPage, totalRows, onPrev, onNext, pageLength, pageLengthOptions, onChangePageLength } = config;

  const from = totalRows === 0 ? 0 : (page - 1) * pageLength + 1;
  const to = Math.min(page * pageLength, totalRows);

  const selectName = `paginado-filas${idSuffix ? `-${idSuffix}` : ""}`;

  return (
    <div className={`flex w-full items-center justify-between px-4 py-3 ${className}`.trim()}>
      {/* Mensaje izquierdo */}
      <span className="text-sm text-foreground-disabled">
        Mostrando {from} a {to} de {totalRows} filas
      </span>

      {/* Controles derechos */}
      <div className="flex items-center gap-2">
        <BotonIcono
          icon="chevronLeft"
          onClick={onPrev}
          disabled={page <= 1}
        />
        <div className="w-28">
          <Select
            label="Filas"
            name={selectName}
            value={String(pageLength)}
            options={pageLengthOptions.map((n) => ({ value: String(n), label: String(n) }))}
            onChange={(value) => onChangePageLength(Number(value))}
            labelPosition="left"
          />
        </div>
        <BotonIcono
          icon="chevronRight"
          onClick={onNext}
          disabled={page >= maxPage}
          className="button-default-icon"
        />
      </div>
    </div>
  );
}
