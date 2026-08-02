"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BotonVolver } from "../ui/botones";

export interface LayoutBaseProps {
  titulo?: string;
  subtitulo?: string;
  acciones?: ReactNode;
  children?: ReactNode;
  /** Omite el padding de la vista (incluido el inferior de scroll), para contenido edge-to-edge como el mapa. */
  noPadding?: boolean;
  /** Muestra un botón "Volver" arriba del título que navega hacia atrás en el historial. */
  volver?: boolean;
}

export function LayoutBase({ titulo, subtitulo, acciones, children, noPadding = false, volver = false }: LayoutBaseProps) {
  const router = useRouter();
  const tieneHeader = Boolean(titulo || volver);

  return (
    <div
      className={`flex flex-col gap-6 ${
        noPadding ? "h-full min-h-0 flex-1" : "p-2 pb-24 md:p-4 md:pb-12 2xl:p-6 2xl:pb-12"
      }`}
    >
      {tieneHeader && (
        <div className="flex flex-col gap-3">
          {volver && (
            <div>
              <BotonVolver onClick={() => router.back()} />
            </div>
          )}
          {titulo && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground-title">{titulo}</h1>
                {subtitulo && <p className="text-foreground-secondary">{subtitulo}</p>}
              </div>
              {acciones}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default LayoutBase;
