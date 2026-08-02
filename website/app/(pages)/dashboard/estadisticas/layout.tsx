import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function EstadisticasLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Estadísticas"
      subtitulo="Compare limnígrafos entre sí o analice la evolución de uno solo período a período."
    >
      {children}
    </LayoutBase>
  );
}
