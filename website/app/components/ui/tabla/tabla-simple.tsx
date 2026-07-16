import { ReactNode } from "react";
import { Card } from "../cards";
import { TableHeader } from "./primitivos/table-header";
import { TableBody } from "./primitivos/table-body";
import { TableRow } from "./primitivos/table-row";
import { IconifyIcon } from "../iconify-icon";
import type { TablaBaseProps } from "./tabla.types";

export interface TablaSimpleProps<T> extends TablaBaseProps<T> {
  className?: string;
}

/** Contenido interno de la tabla, sin el Card wrapper. Reutilizable en variantes paginadas. */
export function TablaSimpleContent<T>({
  columns,
  data,
  rowIdKey,
  isLoading = false,
  loadingRowCount = 5,
  emptyStateContent,
}: TablaBaseProps<T>) {
  const isEmpty = !isLoading && data.length === 0;

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
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="py-4 px-4 text-foreground-title font-medium text-sm"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingRowCount={loadingRowCount}
            columnCount={columns.length}
          >
            {data.map((row, index) => (
              <TableRow key={String(row[rowIdKey])} row={row} index={index}>
                {columns.map((col) => {
                  const key = col.accessorKey ?? (col.id as keyof T);
                  const value = key ? row[key] : null;
                  return (
                    <td
                      key={col.id}
                      className={col.cell ? "" : "px-4 py-4 text-sm text-foreground"}
                    >
                      {col.cell ? col.cell(row) : String(value ?? "")}
                    </td>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      {isEmpty && (emptyStateContent ?? defaultEmptyState)}
    </>
  );
}

/**
 * Tabla básica sin scroll propio ni columna de acciones.
 * Ocupa el ancho disponible del contenedor padre.
 * El empty state se renderiza como un bloque separado debajo de la tabla.
 */
export function TablaSimple<T>({ className = "", ...props }: TablaSimpleProps<T>) {
  return (
    <Card className={className}>
      <TablaSimpleContent {...props} />
    </Card>
  );
}
