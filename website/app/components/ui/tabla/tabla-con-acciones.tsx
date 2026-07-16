"use client";

import { ReactNode, useState, useId } from "react";
import { Card } from "../cards";
import { TableHeader } from "./primitivos/table-header";
import { TableBody } from "./primitivos/table-body";
import { TableRow } from "./primitivos/table-row";
import { IconifyIcon } from "../iconify-icon";
import { BotonIcono } from "../botones";
import { Menu } from "../menu";
import type { TablaBaseProps, ActionConfig, CheckboxConfig } from "./tabla.types";

export interface TablaConAccionesProps<T> extends TablaBaseProps<T> {
  actionConfig: ActionConfig<T>;
  checkboxConfig?: CheckboxConfig<T>;
  className?: string;
}

interface TablaConAccionesContentProps<T> extends TablaBaseProps<T> {
  actionConfig: ActionConfig<T>;
  checkboxConfig?: CheckboxConfig<T>;
}

/** Contenido interno de TablaConAcciones, sin el Card wrapper. Reutilizable en variantes paginadas. */
export function TablaConAccionesContent<T>({
  columns,
  data,
  rowIdKey,
  actionConfig,
  checkboxConfig,
  isLoading = false,
  loadingRowCount = 5,
  emptyStateContent,
}: TablaConAccionesContentProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const checkboxId = useId();

  const isEmpty = !isLoading && data.length === 0;
  const hasCheckbox = Boolean(checkboxConfig);
  const useMenu = actionConfig.menu !== false;

  const totalColumnCount = columns.length + 1 + (hasCheckbox ? 1 : 0);

  // Selección
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const toggleAll = () => {
    const next = isAllSelected ? [] : [...data];
    setSelectedRows(next);
    checkboxConfig?.onSelectionChange(next);
  };

  const toggleRow = (row: T) => {
    const id = row[rowIdKey];
    const exists = selectedRows.some((r) => r[rowIdKey] === id);
    const next = exists
      ? selectedRows.filter((r) => r[rowIdKey] !== id)
      : [...selectedRows, row];
    setSelectedRows(next);
    checkboxConfig?.onSelectionChange(next);
  };

  const isRowSelected = (row: T) =>
    selectedRows.some((r) => r[rowIdKey] === row[rowIdKey]);

  const defaultEmptyState: ReactNode = (
    <div className="flex w-full items-center justify-center gap-2 py-10 text-foreground-disabled">
      <IconifyIcon variant="alerta" className="text-3xl" />
      <span className="text-sm">No hay datos cargados en el sistema</span>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader>
            <tr>
              {/* Checkbox sticky izquierda */}
              {hasCheckbox && (
                <th className="sticky left-0 z-20 bg-background-muted w-12 px-4 py-4">
                  <input
                    id={`${checkboxId}-all`}
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleAll}
                    className="cursor-pointer accent-primary"
                    aria-label="Seleccionar todas las filas"
                  />
                </th>
              )}

              {/* Columnas de datos */}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="py-4 px-4 text-foreground-title font-medium text-sm whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}

              {/* Acciones sticky derecha */}
              <th className="sticky right-0 z-20 bg-background-muted py-4 px-4 text-foreground-title font-medium text-sm text-center">
                Acciones
              </th>
            </tr>
          </TableHeader>

          <TableBody
            isLoading={isLoading}
            loadingRowCount={loadingRowCount}
            columnCount={totalColumnCount}
          >
            {data.map((row, index) => {
              const rowId = String(row[rowIdKey]);
              const selected = isRowSelected(row);

              return (
                <TableRow key={rowId} row={row} index={index}>
                  {/* Checkbox sticky izquierda */}
                  {hasCheckbox && (
                    <td className="sticky left-0 z-10 bg-background-muted w-12 px-4 py-4 border-b border-border">
                      <input
                        id={`${checkboxId}-${rowId}`}
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(row)}
                        className="cursor-pointer accent-primary"
                        aria-label={`Seleccionar fila ${rowId}`}
                      />
                    </td>
                  )}

                  {/* Celdas de datos */}
                  {columns.map((col) => {
                    const key = col.accessorKey ?? (col.id as keyof T);
                    const value = key ? row[key] : null;
                    return (
                      <td
                        key={col.id}
                        className={col.cell ? "" : "px-4 py-4 text-sm text-foreground whitespace-nowrap"}
                      >
                        {col.cell ? col.cell(row) : String(value ?? "")}
                      </td>
                    );
                  })}

                  {/* Acciones sticky derecha */}
                  <td className="sticky right-0 z-10 bg-background-muted px-2 py-2 text-center border-b border-border">
                    {useMenu ? (
                      <Menu
                        items={actionConfig.options.map((opt) => ({
                          label: opt.label,
                          action: opt.action,
                          icon: opt.icon,
                          className: opt.className,
                        }))}
                        side="left"
                        align="start"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {actionConfig.options.map((opt, i) =>
                          opt.render ? (
                            <span key={i}>{opt.render(row)}</span>
                          ) : opt.icon ? (
                            <BotonIcono
                              key={i}
                              icon={opt.icon}
                              onClick={opt.action}
                            />
                          ) : null
                        )}
                      </div>
                    )}
                  </td>
                </TableRow>
              );
            })}
          </TableBody>
        </table>
      </div>

      {isEmpty && (emptyStateContent ?? defaultEmptyState)}
    </>
  );
}

/**
 * Tabla con scroll horizontal y columna de acciones sticky a la derecha.
 * Opcionalmente incluye una columna de selección (checkbox) sticky a la izquierda.
 */
export function TablaConAcciones<T>({ className = "", ...props }: TablaConAccionesProps<T>) {
  return (
    <Card className={className}>
      <TablaConAccionesContent {...props} />
    </Card>
  );
}
