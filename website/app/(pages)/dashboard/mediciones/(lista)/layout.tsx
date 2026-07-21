import type { ReactNode } from "react";

export default function MedicionesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Mediciones</h1>
        <p className="text-foreground-secondary">
          Consulte las mediciones recibidas de los limnígrafos. Filtre por limnígrafo, fuente y ventana de tiempo.
        </p>
      </div>

      {children}
    </div>
  );
}
