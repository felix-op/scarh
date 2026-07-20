"use client";

import { ReactNode, useState, useId } from "react";
import { Card } from "../cards";
import { TableHeader } from "./primitivos/table-header";
import { TableBody } from "./primitivos/table-body";
import { TableRow } from "./primitivos/table-row";
import { IconifyIcon } from "../iconify-icon";
import { BotonIcono } from "../botones";
import { Menu } from "../menu";
import { Checkbox } from "../../shadcn/checkbox";
import type { TablaBaseProps, ActionConfig, CheckboxConfig } from "./tabla.types";

export interface TablaConAccionesProps<T> extends TablaBaseProps<T> {
  actionConfig: ActionConfig<T>;
  checkboxConfig?: CheckboxConfig<T>;
  className?: string;
}

interface TablaConAccionesContentProps<T> extends TablaBaseProps<T> {
  actionConfig: ActionConfig<T>;
  checkboxConfig?: CheckboxConfig<T>;
  bordered?: boolean;
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
  bordered = false,
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
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full border-collapse">
          <TableHeader>
            <tr>
              {/* Checkbox sticky izquierda */}
              {hasCheckbox && (
                <th className={`sticky left-0 z-20 bg-background-muted w-12 px-4 py-4 border-b border-r border-border ${bordered ? "border-l border-t" : ""}`}>
                  <Checkbox
                    id={`${checkboxId}-all`}
                    checked={isIndeterminate ? "indeterminate" : isAllSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Seleccionar todas las filas"
                    className="cursor-pointer"
                  />
                </th>
              )}

              {/* Columnas de datos */}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`py-4 px-4 text-foreground-title font-medium text-sm whitespace-nowrap border-b border-border ${bordered ? "border" : ""}`}
                >
                  {col.sort ? (
                    <button
                      onClick={col.sort}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
                    >
                      {col.header}
                      <IconifyIcon
                        variant="sortear"
                        className="text-base text-foreground-disabled group-hover:text-foreground transition-colors shrink-0"
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}

              {/* Acciones sticky derecha */}
              <th className={`sticky right-0 z-20 bg-background-muted py-4 px-4 text-foreground-title font-medium text-sm text-center w-1 whitespace-nowrap border-b border-border ${bordered ? "border-l border-t border-r" : ""}`}>
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
                    <td className={`sticky left-0 z-10 bg-background-muted w-12 px-4 py-4 border-b border-r border-border ${bordered ? "border-l" : ""}`}>
                      <Checkbox
                        id={`${checkboxId}-${rowId}`}
                        checked={selected}
                        onCheckedChange={() => toggleRow(row)}
                        aria-label={`Seleccionar fila ${rowId}`}
                        className="cursor-pointer"
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
                        className={`px-4 py-4 text-sm whitespace-nowrap border-b border-border ${bordered ? "border" : ""} ${col.cell ? "" : "text-foreground"}`}
                      >
                        {col.cell ? col.cell(row) : String(value ?? "")}
                      </td>
                    );
                  })}

                  {/* Acciones sticky derecha */}
                  <td className={`sticky right-0 z-10 bg-background-muted px-2 py-2 text-center border-b border-border w-1 whitespace-nowrap ${bordered ? "border-r border-l" : ""}`}>
                    {useMenu ? (
                      <Menu
                        items={actionConfig.options
                          .filter((opt) => !opt.condition || opt.condition(row))
                          .map((opt) => ({
                            label: opt.label,
                            action: () => opt.action(row),
                            icon: opt.icon,
                            className: opt.className,
                            disabled: opt.disabled,
                          }))}
                        side="left"
                        align="start"
                      />
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {actionConfig.options
                          .filter((opt) => !opt.condition || opt.condition(row))
                          .map((opt, i) =>
                            opt.render ? (
                              <span key={i}>{opt.render(row)}</span>
                            ) : opt.icon ? (
                              <BotonIcono
                                key={i}
                                icon={opt.icon}
                                disabled={opt.disabled}
                                onClick={() => opt.action(row)}
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
