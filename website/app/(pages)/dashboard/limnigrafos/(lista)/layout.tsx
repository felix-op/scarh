import type { ReactNode } from "react";

export default function LimnigrafosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Gestión de Limnígrafos</h1>
        <p className="text-foreground-secondary">
          Administre los limnígrafos del sistema, su configuración y sus rutas de acceso.
        </p>
      </div>

      {children}
    </div>
  );
}
