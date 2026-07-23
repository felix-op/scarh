"use client";

import { useEffect, useState } from "react";
import { Chip, type ChipVariant } from "../ui/chip";
import { hmsLegibles, formatFechaHora, tieneCoberturaAlertas } from "@utils";
import type { LimnigrafoResponse } from "@models";

/** Ticking clock; null hasta el primer efecto para no romper la hidratación de SSR. */
function useAhora(intervaloMs = 1000) {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    // Sincroniza con el reloj real del sistema recién al montar (evita mismatch de hidratación SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return ahora;
}

type EstadoConexionLive = "en_linea" | "demorado" | "sin_conexion";

const ESTADO_COLOR: Record<EstadoConexionLive, { variant: ChipVariant; barra: string }> = {
  en_linea: { variant: "success", barra: "bg-success" },
  demorado: { variant: "warn", barra: "bg-warn" },
  sin_conexion: { variant: "error", barra: "bg-error" },
};

export interface EstadoConexionLimnigrafoProps {
  limnigrafo: LimnigrafoResponse;
}

export function EstadoConexionLimnigrafo({ limnigrafo }: EstadoConexionLimnigrafoProps) {
  const ahora = useAhora();
  const medicion = limnigrafo.ultima_medicion;
  const cfg = limnigrafo.configuracion;

  if (!medicion) {
    return (
      <div className="flex items-center gap-2">
        <Chip variant="none">Sin datos</Chip>
        <span className="text-sm text-foreground-secondary">Este limnígrafo todavía no registró ninguna medición.</span>
      </div>
    );
  }

  // Dispositivo sin conexión a internet (ej. sólo USB): el timeline de umbrales no aplica.
  if (!tieneCoberturaAlertas(limnigrafo.tipo_comunicacion)) {
    return (
      <div className="flex items-center gap-2">
        <Chip variant="none">Sin conexión</Chip>
        <span className="text-sm text-foreground-secondary">El dispositivo no tiene conexión a internet.</span>
      </div>
    );
  }

  const tiempoAdvertencia = cfg?.tiempo_advertencia ?? Infinity;
  const tiempoPeligro = cfg?.tiempo_peligro ?? Infinity;

  const elapsedSegundos = ahora
    ? Math.max(0, Math.floor((ahora.getTime() - new Date(medicion.fecha_hora).getTime()) / 1000))
    : 0;

  const estado: EstadoConexionLive =
    elapsedSegundos < tiempoAdvertencia ? "en_linea" : elapsedSegundos < tiempoPeligro ? "demorado" : "sin_conexion";

  const porcentaje =
    Number.isFinite(tiempoPeligro) && tiempoPeligro > 0 ? Math.min(100, (elapsedSegundos / tiempoPeligro) * 100) : 0;

  const ultimaConexionLegible = formatFechaHora(medicion.fecha_hora);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <Chip variant={estado === "en_linea" ? ESTADO_COLOR.en_linea.variant : "none"}>En línea</Chip>
          <span className="text-xs text-foreground-secondary">hace {hmsLegibles(elapsedSegundos)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Chip variant={estado === "demorado" ? ESTADO_COLOR.demorado.variant : "none"}>Demorado</Chip>
          <span className="text-xs text-foreground-secondary">{hmsLegibles(cfg?.tiempo_advertencia)}</span>
          <span className="text-xs text-foreground-secondary">{ultimaConexionLegible}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Chip variant={estado === "sin_conexion" ? ESTADO_COLOR.sin_conexion.variant : "none"}>Sin conexión</Chip>
          <span className="text-xs text-foreground-secondary">{hmsLegibles(cfg?.tiempo_peligro)}</span>
          <span className="text-xs text-foreground-secondary">{ultimaConexionLegible}</span>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-background-muted overflow-hidden">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear ${ESTADO_COLOR[estado].barra}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

export default EstadoConexionLimnigrafo;
