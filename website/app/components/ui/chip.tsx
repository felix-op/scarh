import React, { ReactNode } from "react";

export type ChipVariant = "none" | "success" | "error" | "warn" | "info";
export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
  children?: ReactNode;
}

const variantConfig: Record<ChipVariant, { style: string; defaultLabel: string }> = {
  success: { style: "bg-success-light/20 text-success border-success/30", defaultLabel: "Ok" },
  error: { style: "bg-error-light/20 text-error border-error/30", defaultLabel: "Error" },
  warn: { style: "bg-warn-light/20 text-warn border-warn/30", defaultLabel: "Warn" },
  info: { style: "bg-primary-light/20 text-primary border-primary/30", defaultLabel: "Info" },
  none: { style: "bg-background-muted text-foreground-secondary border-border", defaultLabel: "-" },
};

const sizeConfig: Record<ChipSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function Chip({
  variant = "none",
  size = "md",
  className = "",
  children,
}: ChipProps) {
  const config = variantConfig[variant];
  const sizeStyle = sizeConfig[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium border ${config.style} ${sizeStyle} ${className}`}
    >
      {children || config.defaultLabel}
    </span>
  );
}

export default Chip;
