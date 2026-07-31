import { Card } from "../cards";
import { Paginado, type PaginationConfig } from "../paginado";
import { TablaSimpleContent, type TablaSimpleProps } from "./tabla-simple";

export interface TablaPaginadaProps<T> extends TablaSimpleProps<T> {
  paginationConfig: PaginationConfig;
  paginationPosition?: "top" | "bottom" | "both";
  /** Deshabilita el selector de filas por página y los botones de navegación, ej. mientras se aplican filtros. */
  disabledSelector?: boolean;
}

/**
 * Wrapper de `TablaSimple` con paginación configurable.
 * Toda la UI vive en un único `Card`.
 */
export function TablaPaginada<T>({
  paginationConfig,
  paginationPosition = "bottom",
  disabledSelector = false,
  className = "",
  ...tablaProps
}: TablaPaginadaProps<T>) {
  const showTop = paginationPosition === "top" || paginationPosition === "both";
  const showBottom = paginationPosition === "bottom" || paginationPosition === "both";

  return (
    <Card className={className}>
      {showTop && (
        <div className="border-b border-border">
          <Paginado config={paginationConfig} idSuffix="top" disabled={disabledSelector} />
        </div>
      )}

      <TablaSimpleContent {...tablaProps} />

      {showBottom && (
        <div className="border-t border-border">
          <Paginado config={paginationConfig} idSuffix="bottom" disabled={disabledSelector} />
        </div>
      )}
    </Card>
  );
}
