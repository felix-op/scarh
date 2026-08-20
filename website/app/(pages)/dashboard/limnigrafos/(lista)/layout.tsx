import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function LimnigrafosLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Limnígrafos"
      subtitulo="Administre los limnígrafos del sistema, su configuración y sus rutas de acceso."
    >
      {children}
    </LayoutBase>
  );
}
