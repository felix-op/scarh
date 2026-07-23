import { ReactNode } from "react";
import { Card } from "./cards";

export interface SeccionAgruparInformacionProps {
  /** Título de la sección */
  title: string;
  /** Contenido de la sección */
  children: ReactNode;
  /** Clases adicionales para el contenedor principal de la card */
  className?: string;
  /** Clases adicionales para el div que contiene a los children (por defecto flex flex-col gap-4) */
  contentClassName?: string;
}

/**
 * Componente que agrupa información dentro de una tarjeta (Card) con un título (h2).
 * Ideal para organizar secciones en formularios o vistas de detalles.
 */
export function SeccionAgruparInformacion({
  title,
  children,
  className = "p-5",
  contentClassName = "flex flex-col gap-4",
}: SeccionAgruparInformacionProps) {
  return (
    <Card className={className}>
      <div className={contentClassName}>
        <h2 className="text-lg font-semibold text-foreground-title">{title}</h2>
        {children}
      </div>
    </Card>
  );
}
