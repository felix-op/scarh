import { ReactNode } from "react";

export interface TableRowProps<T> {
  row: T;
  index: number;
  children: ReactNode;
  animated?: boolean;
  onClick?: (row: T) => void;
  className?: string | ((row: T, index: number) => string);
}

/**
 * Fila de body de tabla (`<tr>`) con hover, borde inferior y animación de entrada opcional.
 */
export function TableRow<T>({
  row,
  index,
  children,
  animated = true,
  onClick,
  className = "",
}: TableRowProps<T>) {
  const resolvedClassName = typeof className === "function" ? className(row, index) : className;

  const classes = [
    "border-b border-border",
    "hover:bg-hover",
    animated ? "opacity-0 animate-fade-in-up" : "",
    onClick ? "cursor-pointer" : "",
    resolvedClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr
      className={classes}
      style={animated ? { animationDelay: `${index * 0.05}s` } : undefined}
      onClick={onClick ? () => onClick(row) : undefined}
    >
      {children}
    </tr>
  );
}
