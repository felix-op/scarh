import { ReactNode } from "react";

export interface TableHeaderProps {
  children: ReactNode;
}

/**
 * Encabezado de tabla (`<thead>`) con estilos del sistema de diseño.
 * Sticky en la parte superior cuando la tabla tiene scroll vertical.
 */
export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="sticky top-0 z-10 bg-background-muted text-left border-b border-border">
      {children}
    </thead>
  );
}
