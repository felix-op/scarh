import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function MedicionesLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Mediciones"
      subtitulo="Consulte las mediciones recibidas de los limnígrafos. Filtre por limnígrafo, fuente y ventana de tiempo."
    >
      {children}
    </LayoutBase>
  );
}
