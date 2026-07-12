import React from "react";

export interface PaperProps {
  children?: React.ReactNode;
  className?: string; // Permite inyectar clases de espaciado y layout (paddings, flex, grid, etc.)
}

export function Paper({ children, className = "" }: PaperProps) {
  const classes = `paper ${className}`.trim();
  return <div className={classes}>{children}</div>;
}

export interface CardProps {
  children?: React.ReactNode;
  animated?: boolean;
  className?: string; // Permite inyectar clases de espaciado y layout
}

export function Card({ children, animated = true, className = "" }: CardProps) {
  const classes = `card ${animated ? "card-animated" : ""} ${className}`.trim();
  return <div className={classes}>{children}</div>;
}

export interface CardStatusProps {
  children?: React.ReactNode;
  status: "success" | "error" | "warning" | "info";
  direction?: "left" | "top" | "right" | "bottom";
  className?: string; // Permite inyectar clases de espaciado y layout
}

export function CardStatus({
  children,
  status,
  direction = "left",
  className = "",
}: CardStatusProps) {
  const classes = `card-status card-status-${status} card-status-${direction} ${className}`.trim();
  return <div className={classes}>{children}</div>;
}
