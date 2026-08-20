"use client";

import { useEffect, useState } from "react";

/** Fecha y hora local, actualizada en vivo sin competir con los controles del header. */
export function HeaderFechaHora() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(new Date()), 1_000);
    return () => window.clearInterval(intervalo);
  }, []);

  if (!ahora) return <span className="hidden lg:block lg:w-44" aria-hidden="true" />;

  const fecha = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(ahora);
  const hora = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(ahora);

  return (
    <div className="hidden min-w-44 border-l border-border pl-4 text-sm lg:flex lg:flex-col lg:gap-0">
      <span className="self-center capitalize leading-none text-foreground-secondary">{fecha}</span>
      <time className="self-center leading-none font-semibold text-foreground">{hora}</time>
    </div>
  );
}

export default HeaderFechaHora;
