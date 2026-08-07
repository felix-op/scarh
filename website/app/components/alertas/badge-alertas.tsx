"use client";

import type { ReactNode } from "react";
import { useConteoAlertasNoLeidas } from "@hooks";

/**
 * Envuelve un elemento (el avatar del perfil) y le superpone la cantidad de alertas
 * sin leer. Existe como componente propio porque el avatar aparece en dos lugares
 * —sidebar de escritorio y cabecera móvil— y el contador tiene que ser el mismo.
 *
 * @property {ReactNode} [children] Elemento sobre el que se posa el contador.
 * @property {string} [className] Clases extra del contenedor.
 */
export interface BadgeAlertasProps {
  children: ReactNode;
  className?: string;
}

export function BadgeAlertas({ children, className = "" }: BadgeAlertasProps) {
  const { data: conteo } = useConteoAlertasNoLeidas();
  const sinLeer = conteo ?? 0;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`.trim()}>
      {children}
      {sinLeer > 0 && (
        <span
          // El número es el dato; el color sólo lo refuerza, así que se lee igual
          // sin distinguir colores.
          className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-shape-full bg-error px-1 text-xs font-bold leading-4 text-error-contrast"
          aria-label={sinLeer === 1 ? "1 alerta sin leer" : `${sinLeer} alertas sin leer`}
        >
          {sinLeer > 9 ? "9+" : sinLeer}
        </span>
      )}
    </span>
  );
}
