import type { ReactNode } from "react";
import { LayoutBase } from "@components";

export default function UsuariosLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutBase
      titulo="Administración de Usuarios"
      subtitulo="Gestione los usuarios del sistema, sus datos y los roles asignados para el control de permisos."
    >
      {children}
    </LayoutBase>
  );
}
