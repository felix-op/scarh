"use client";

import { ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../shadcn/tooltip";
import { IconifyIcon } from "./iconify-icon";

export interface InfoTooltipProps {
  content: ReactNode;
  className?: string;
}

/** Ícono de ayuda con tooltip. Útil para explicar campos (ej. los tiempos del limnígrafo). */
export function InfoTooltip({ content, className = "" }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Más información"
            className={`inline-flex text-foreground-disabled hover:text-primary transition-colors outline-none ${className}`.trim()}
          >
            <IconifyIcon variant="alerta" className="text-base" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-left">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InfoTooltip;
