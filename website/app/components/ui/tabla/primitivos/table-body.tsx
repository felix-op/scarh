"use client";

import { ReactNode } from "react";
import { IconifyIcon } from "../../iconify-icon";

export interface TableBodyProps {
  isLoading?: boolean;
  loadingRowCount?: number;
  columnCount: number;
  children: ReactNode;
}

/**
 * Cuerpo de tabla (`<tbody>`).
 * Maneja el skeleton de loading. El empty state se renderiza fuera de la tabla
 * (a nivel de variante) para no romper el layout.
 */
export function TableBody({
  isLoading = false,
  loadingRowCount = 5,
  columnCount,
  children,
}: TableBodyProps) {
  if (isLoading) {
    return (
      <tbody>
        {Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
          <tr key={`skeleton-row-${rowIndex}`} className="animate-pulse border-b border-border">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-4 py-4">
                <div className="h-2 w-full rounded-shape-sm bg-default-light" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return <tbody>{children}</tbody>;
}
