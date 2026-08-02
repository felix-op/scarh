"use client";

import { ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../shadcn/tooltip";
import { IconifyIcon } from "./iconify-icon";

/**
 * @property {ReactNode} [content] Texto de ayuda. Sin él no se muestra tooltip:
 *   permite dejar el componente puesto y activarlo sólo cuando hace falta.
 * @property {string} [className] Clases del disparador (ícono o envoltorio).
 * @property {ReactNode} [children] Si se provee, el tooltip envuelve estos
 *   elementos en lugar de dibujar un ícono aparte.
 */
export interface InfoTooltipProps {
  content?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Ayuda contextual, en dos modos.
 *
 * Sin `children` es un ícono de ayuda al lado del campo que explica. Con
 * `children` envuelve el control mismo, que es lo que corresponde cuando hay que
 * explicar por qué está deshabilitado: un ícono suelto al lado no se asocia
 * visualmente al control, y un botón apagado sin motivo se lee como roto.
 *
 * El envoltorio es un `span` y no el propio control: los elementos con `disabled`
 * no emiten eventos de puntero, así que un tooltip aplicado directamente sobre
 * ellos nunca se abriría. `tabIndex` mantiene el acceso por teclado, que también
 * se pierde al deshabilitar.
 */
export function InfoTooltip({ content, className = "", children }: InfoTooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span tabIndex={0} className={`inline-block outline-none ${className}`.trim()}>
              {children}
            </span>
          ) : (
            <button
              type="button"
              aria-label="Más información"
              className={`inline-flex text-foreground-disabled hover:text-primary transition-colors outline-none ${className}`.trim()}
            >
              <IconifyIcon variant="alerta" className="text-base" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-left">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InfoTooltip;
