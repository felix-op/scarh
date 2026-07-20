"use client";

import { IconifyIcon } from "@components";
import { Mensaje } from "@services";
import { useMensajeConfig } from "@hooks";

const configMap = {
  alert: { icon: "alerta", color: "text-warn", bgProgress: "bg-warn" },
  error: { icon: "cancelar", color: "text-error", bgProgress: "bg-error" },
  info: { icon: "documento", color: "text-primary", bgProgress: "bg-primary" },
  success: { icon: "check", color: "text-success", bgProgress: "bg-success" },
} as const;

interface MensajeFlotanteProps {
  mensaje: Mensaje;
  onRemove: (_id: string) => void;
}

export function MensajeFlotante({ mensaje, onRemove }: MensajeFlotanteProps) {
  const config = configMap[mensaje.type];
  const { isHovered, setIsHovered, initialDuration } = useMensajeConfig(mensaje, onRemove);

  return (
    <div 
      className="flex flex-col rounded-shape-md bg-card shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] w-80 animate-fade-in-up border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Removemos "as any" ya que el user lo corrigió */}
        <IconifyIcon variant={config.icon} className={`text-2xl shrink-0 ${config.color}`} />
        <div className="flex flex-col gap-1 w-full pt-0.5">
          <strong className={`${config.color} text-sm leading-none`}>{mensaje.title}</strong>
          {mensaje.content && (
            <p className="text-foreground text-sm m-0 leading-tight">{mensaje.content}</p>
          )}
        </div>
        <button 
          onClick={() => onRemove(mensaje.id)}
          className="text-foreground-secondary hover:text-foreground shrink-0 transition-colors"
        >
          <IconifyIcon variant="cancelar" className="text-lg" />
        </button>
      </div>
      {initialDuration !== null ? (
        <div 
          className={`${config.bgProgress} min-h-1 rounded-b-shape-md animate-progress-shrink origin-left`}
          style={{ 
            animationDuration: `${initialDuration}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationPlayState: isHovered ? "paused" : "running"
          }}
        />
      ) : (
        <div className="min-h-1"></div>
      )}
    </div>
  );
}
