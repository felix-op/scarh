"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BotonVolver } from "../ui/botones";

export interface LayoutBaseProps {
  /** Acepta nodos además de texto: la pantalla de inicio pasa un componente. */
  titulo?: ReactNode;
  subtitulo?: string;
  acciones?: ReactNode;
  children?: ReactNode;
  /** Omite el padding de la vista (incluido el inferior de scroll), para contenido edge-to-edge como el mapa. */
  noPadding?: boolean;
  /** Muestra un botón "Volver" arriba del título que navega hacia atrás en el historial. */
  volver?: boolean;
}

export function LayoutBase({ acciones, children, noPadding = false, volver = false }: LayoutBaseProps) {
  const router = useRouter();
  const tieneControles = Boolean(volver || acciones);

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${noPadding ? "overflow-hidden" : "overflow-y-auto"}`}>
      <div
        className={`flex min-h-0 flex-1 flex-col gap-6 ${
          noPadding ? "overflow-hidden" : "p-2 pb-24 md:p-4 md:pb-12 2xl:p-6 2xl:pb-12"
        }`}
      >
        {tieneControles && (
          <div className="flex items-center justify-between gap-3">
            {volver && (
              <BotonVolver onClick={() => router.back()} />
            )}
            {acciones && <div className={volver ? "ml-auto" : "w-full"}>{acciones}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default LayoutBase;
