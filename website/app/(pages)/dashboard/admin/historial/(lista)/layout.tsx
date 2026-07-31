import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function HistorialLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Historial de Acciones"
      subtitulo="Consulte el registro de auditoría de todas las acciones que modificaron datos en el sistema. Sólo lectura."
    >
      {children}
    </LayoutBase>
  );
}
