"use client";

import { useMemo, useState } from "react";
import { useGetLimnigrafos } from "@hooks";
import { TablaConAccionesPaginada, type ActionConfig } from "../ui/tabla";
import { AccionesImportacion } from "./acciones-importacion";
import { detectarFormatoImportacion, getColumnasImportacionMediciones } from "./configuraciones-tabla";
import type { MedicionRowType } from "@utils";
import type { LimnigrafoResponse } from "@models";

type FiltroImportacion = "todas" | "listas" | "errores" | "duplicadas";

interface TablaMedicionesImportacionProps {
  rows: MedicionRowType[];
  onEditRow: (row: MedicionRowType) => void;
  onDeleteRow: (row: MedicionRowType) => void;
}

const FILTROS: { value: FiltroImportacion; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "listas", label: "Listas para subir" },
  { value: "errores", label: "Con errores de formato" },
  { value: "duplicadas", label: "Duplicadas" },
];

function coincideFiltro(row: MedicionRowType, filtro: FiltroImportacion): boolean {
  switch (filtro) {
    case "listas":
      return row.status === "valid";
    case "errores":
      return row.status === "error";
    case "duplicadas":
      return row.status === "duplicate_file" || row.status === "duplicate_database";
    default:
      return true;
  }
}

export function TablaMedicionesImportacion({ rows, onEditRow, onDeleteRow }: TablaMedicionesImportacionProps) {
  const { data } = useGetLimnigrafos();
  const [filtro, setFiltro] = useState<FiltroImportacion>("todas");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const limnigrafoCodeById = useMemo(() => {
    const map = new Map<number, string>();
    (data?.results || []).forEach((limnigrafo: LimnigrafoResponse) => map.set(limnigrafo.id, limnigrafo.codigo));
    return map;
  }, [data]);

  const formato = useMemo(() => detectarFormatoImportacion(rows), [rows]);
  const columns = useMemo(
    () => getColumnasImportacionMediciones(formato, { limnigrafoCodeById }),
    [formato, limnigrafoCodeById]
  );

  const filteredRows = useMemo(() => rows.filter((row) => coincideFiltro(row, filtro)), [rows, filtro]);

  const maxPage = Math.max(1, Math.ceil(filteredRows.length / limit));
  const paginaActual = Math.min(page, maxPage);
  const pageRows = filteredRows.slice((paginaActual - 1) * limit, paginaActual * limit);

  const actionConfig: ActionConfig<MedicionRowType> = {
    menu: false,
    options: [
      {
        label: "Acciones",
        action: () => {},
        render: (row) => (
          <AccionesImportacion
            onEdit={() => onEditRow(row)}
            onDelete={() => onDeleteRow(row)}
            issues={row.issues}
          />
        ),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const count = rows.filter((row) => coincideFiltro(row, f.value)).length;
          const active = filtro === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setFiltro(f.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-shape-full text-sm border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground-secondary border-border hover:bg-hover"
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      <TablaConAccionesPaginada
        columns={columns}
        data={pageRows}
        rowIdKey="rowNumber"
        actionConfig={actionConfig}
        bordered
        paginationPosition="both"
        paginationConfig={{
          page: paginaActual,
          maxPage,
          totalRows: filteredRows.length,
          onPrev: () => setPage((p) => Math.max(1, p - 1)),
          onNext: () => setPage((p) => Math.min(maxPage, p + 1)),
          pageLength: limit,
          pageLengthOptions: [10, 25, 50, 100],
          onChangePageLength: (length) => {
            setLimit(length);
            setPage(1);
          },
        }}
        emptyStateContent={
          <div className="flex w-full items-center justify-center py-10 text-foreground-disabled text-sm">
            No hay filas que coincidan con el filtro seleccionado.
          </div>
        }
      />
    </div>
  );
}
