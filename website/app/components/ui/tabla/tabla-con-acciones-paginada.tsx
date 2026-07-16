"use client";

import { Card } from "../cards";
import { Paginado, type PaginationConfig } from "../paginado";
import { TablaConAccionesContent, type TablaConAccionesProps } from "./tabla-con-acciones";

export interface TablaConAccionesPaginadaProps<T> extends TablaConAccionesProps<T> {
  paginationConfig: PaginationConfig;
  paginationPosition?: "top" | "bottom" | "both";
}

/**
 * Wrapper de `TablaConAcciones` con paginación configurable.
 * Toda la UI vive en un único `Card`.
 * Marcado como `"use client"` porque `TablaConAccionesContent` utiliza `useState`.
 */
export function TablaConAccionesPaginada<T>({
  paginationConfig,
  paginationPosition = "bottom",
  className = "",
  ...tablaProps
}: TablaConAccionesPaginadaProps<T>) {
  const showTop = paginationPosition === "top" || paginationPosition === "both";
  const showBottom = paginationPosition === "bottom" || paginationPosition === "both";

  return (
    <Card className={className}>
      {showTop && (
        <div className="border-b border-border">
          <Paginado config={paginationConfig} idSuffix="top" />
        </div>
      )}

      <TablaConAccionesContent {...tablaProps} />

      {showBottom && (
        <div className="border-t border-border">
          <Paginado config={paginationConfig} idSuffix="bottom" />
        </div>
      )}
    </Card>
  );
}
