import type { ReactNode } from "react";

export default function UsuariosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Administración de Usuarios</h1>
        <p className="text-foreground-secondary">
          Gestione los usuarios del sistema, sus datos y los roles asignados para el control de permisos.
        </p>
      </div>

      {children}
    </div>
  );
}
