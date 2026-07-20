import type { ReactNode } from "react";

export default function HistorialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Historial de Acciones</h1>
        <p className="text-foreground-secondary">
          Consulte el registro de auditoría de todas las acciones que modificaron datos en el sistema. Sólo lectura.
        </p>
      </div>

      {children}
    </div>
  );
}
