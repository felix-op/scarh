"use client";

import { Card } from "../cards";
import { Paginado, type PaginationConfig } from "../paginado";
import { TablaConAccionesContent, type TablaConAccionesProps } from "./tabla-con-acciones";

export interface TablaConAccionesPaginadaProps<T> extends TablaConAccionesProps<T> {
  paginationConfig: PaginationConfig;
  paginationPosition?: "top" | "bottom" | "both";
  /** Deshabilita el selector de filas por página y los botones de navegación, ej. mientras se aplican filtros. */
  disabledSelector?: boolean;
}

/**
 * Wrapper de `TablaConAcciones` con paginación configurable.
 * Toda la UI vive en un único `Card`.
 * Marcado como `"use client"` porque `TablaConAccionesContent` utiliza `useState`.
 */
export function TablaConAccionesPaginada<T>({
  paginationConfig,
  paginationPosition = "bottom",
  disabledSelector = false,
  className = "",
  ...tablaProps
}: TablaConAccionesPaginadaProps<T>) {
  const showTop = paginationPosition === "top" || paginationPosition === "both";
  const showBottom = paginationPosition === "bottom" || paginationPosition === "both";

  return (
    <Card className={`flex min-h-0 flex-col ${className}`.trim()}>
      {showTop && (
        <div className="border-b border-border">
          <Paginado config={paginationConfig} idSuffix="top" disabled={disabledSelector} />
        </div>
      )}

      <TablaConAccionesContent {...tablaProps} />

      {showBottom && (
        <div className="border-t border-border">
          <Paginado config={paginationConfig} idSuffix="bottom" disabled={disabledSelector} />
        </div>
      )}
    </Card>
  );
}
