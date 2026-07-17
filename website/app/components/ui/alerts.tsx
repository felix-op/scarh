import React, { ReactNode } from "react";
import { IconifyIcon, IconVariants } from "./iconify-icon";

const variantConfig: Record<
  string,
  { bg: string; border: string; color: string; icon: IconVariants }
> = {
  exito: {
    bg: "bg-success-light/10",
    border: "border-success",
    color: "text-success",
    icon: "check",
  },
  error: {
    bg: "bg-error-light/10",
    border: "border-error",
    color: "text-error",
    icon: "eliminar",
  },
  info: {
    bg: "bg-primary-light/10",
    border: "border-primary",
    color: "text-primary",
    icon: "info",
  },
  alerta: {
    bg: "bg-warn-light/10",
    border: "border-warn",
    color: "text-warn",
    icon: "alerta",
  },
  default: {
    bg: "bg-background-default",
    border: "border-border",
    color: "text-foreground",
    icon: "documento",
  },
};

export type AlertVariant = keyof typeof variantConfig;

export interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  title?: string;
  children: ReactNode;
}

export function Alert({
  variant = "default",
  className = "",
  title,
  children,
}: AlertProps) {
  const config = variantConfig[variant] || variantConfig.default;
  const isString = typeof children === "string";

  return (
    <div
      className={`flex items-start gap-3 rounded-shape-md p-3 border-2 shadow-sm ${config.bg} ${config.border} ${className}`}
    >
      <IconifyIcon variant={config.icon} className={`text-2xl shrink-0 ${config.color}`} />
      <div className="flex flex-col gap-1 w-full pt-0.5">
        {title && <strong className={`${config.color} text-sm leading-none`}>{title}</strong>}
        {isString ? (
          <p className="text-foreground text-sm m-0 leading-tight">{children}</p>
        ) : (
          <div className="text-foreground text-sm leading-tight">{children}</div>
        )}
      </div>
    </div>
  );
}

export default Alert;
