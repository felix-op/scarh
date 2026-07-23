import { Card } from "./cards";

export interface FiltersPlaceholderProps {
  /** Cantidad de filtros simulados a mostrar (por defecto 3) */
  count?: number;
  className?: string;
}

/**
 * Skeleton que simula la barra de filtros principal (Card + Textfields/Selects + Botón).
 */
export function FiltersPlaceholder({ count = 3, className = "" }: FiltersPlaceholderProps) {
  return (
    <Card className={`p-2 animate-pulse ${className}`.trim()}>
      <div className="flex flex-col gap-4">
        {/* Fila 1: Filtros (Grid responsivo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1.5 w-full ${
                // El primer elemento a veces ocupa 2 columnas en MD para el buscador
                i === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Skeleton del label */}
              <div className="h-4 w-24 bg-background-muted rounded-shape-sm" />
              {/* Skeleton del input */}
              <div className="h-10 w-full bg-background-muted rounded-shape-sm" />
            </div>
          ))}
        </div>

        {/* Fila 2: Botón Agregar alineado a la derecha */}
        <div className="flex justify-end w-full mt-2">
          <div className="h-10 w-32 bg-background-muted rounded-shape-sm" />
        </div>
      </div>
    </Card>
  );
}

export default FiltersPlaceholder;
