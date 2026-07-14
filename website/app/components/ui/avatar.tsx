function obtenerIniciales(nombre?: string, apellido?: string, fallback?: string) {
  const primerNombre = nombre?.trim().charAt(0) ?? "";
  const primerApellido = apellido?.trim().charAt(0) ?? "";
  const iniciales = `${primerNombre}${primerApellido}`.trim();
  if (iniciales) return iniciales.toUpperCase();
  if (fallback) return fallback.trim().slice(0, 2).toUpperCase();
  return "US";
}

export interface AvatarProps {
  nombre?: string;
  apellido?: string;
  username?: string;
  url?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-2xl",
};

export function Avatar({ nombre, apellido, username, url, size = "md", className = "" }: AvatarProps) {
  const classes = `flex shrink-0 items-center justify-center rounded-shape-full overflow-hidden border border-border bg-primary text-primary-contrast font-semibold ${sizeClasses[size]} ${className}`.trim();

  if (url) {
    return (
      <div className={classes}>
        <img src={url} alt={nombre ?? username ?? "Usuario"} className="h-full w-full object-cover" />
      </div>
    );
  }

  return <div className={classes}>{obtenerIniciales(nombre, apellido, username)}</div>;
}
