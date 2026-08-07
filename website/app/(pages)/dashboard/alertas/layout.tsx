import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function AlertasLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Alertas"
      subtitulo="Consulte las alertas generadas por los limnígrafos. Filtre por estado, tipo y vigencia de la condición."
    >
      {children}
    </LayoutBase>
  );
}
