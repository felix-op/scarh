"use client";

/** Puerto rápido de `shared/componentes/LimnigrafosSidebar.tsx` (legacy). */

import { useState } from "react";
import {
  LimnigrafosMapaPanel,
  LimnigrafoMapaMenu,
  VentanaEditarMapaUbicacion,
  VentanaEliminarMapaUbicacion,
  type FiltrosMapaState,
} from "../mapa";
import { FILTROS_MAPA_INICIALES } from "../mapa/limnigrafos-mapa-panel";
import { tieneCoberturaAlertas } from "@utils";
import type { LimnigrafoResponse } from "@models";

export interface LimnigrafosMapaSidebarProps {
  limnigrafos: LimnigrafoResponse[];
  selectedLimnigrafo: LimnigrafoResponse | null;
  onSelectLimnigrafo: (limnigrafo: LimnigrafoResponse) => void;
  onMoverUbicacion?: (limnigrafo: LimnigrafoResponse) => void;
  onVerEnMapa?: (limnigrafo: LimnigrafoResponse) => void;
}

const ESTADO_CONEXION_COLOR: Record<string, string> = {
  en_linea: "#82d987",
  demorado: "#facc15",
};
const COLOR_SIN_CONEXION_ALERTA = "#ef4444";
const COLOR_NEUTRAL = "#9ca3af";

function getColor(limnigrafo: LimnigrafoResponse): string {
  if (ESTADO_CONEXION_COLOR[limnigrafo.estado_conexion]) return ESTADO_CONEXION_COLOR[limnigrafo.estado_conexion];
  if (limnigrafo.estado_conexion === "sin_conexion") {
    return tieneCoberturaAlertas(limnigrafo.tipo_comunicacion) ? COLOR_SIN_CONEXION_ALERTA : COLOR_NEUTRAL;
  }
  return COLOR_NEUTRAL;
}

function tieneUbicacion(limnigrafo: LimnigrafoResponse): boolean {
  return Boolean(limnigrafo.ubicacion?.geometry?.coordinates);
}

export function LimnigrafosMapaSidebar({
  limnigrafos,
  selectedLimnigrafo,
  onSelectLimnigrafo,
  onMoverUbicacion,
  onVerEnMapa,
}: LimnigrafosMapaSidebarProps) {
  const [filtros, setFiltros] = useState<FiltrosMapaState>(FILTROS_MAPA_INICIALES);
  const [editandoUbicacion, setEditandoUbicacion] = useState<LimnigrafoResponse | null>(null);
  const [quitandoUbicacion, setQuitandoUbicacion] = useState<LimnigrafoResponse | null>(null);

  const handleFiltroChange = <K extends keyof FiltrosMapaState>(campo: K, valor: FiltrosMapaState[K]) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const filtrados = limnigrafos.filter((lim) => {
    const texto = filtros.busqueda.toLowerCase();
    const matchesBusqueda =
      lim.codigo.toLowerCase().includes(texto) || (lim.ubicacion?.nombre?.toLowerCase().includes(texto) ?? false);

    const matchesUbicacion =
      filtros.ubicacion === "todos" ||
      (filtros.ubicacion === "ubicados" && tieneUbicacion(lim)) ||
      (filtros.ubicacion === "no_ubicados" && !tieneUbicacion(lim));

    const matchesConexion = filtros.conexion === "todos" || lim.estado_conexion === filtros.conexion;
    const matchesMedicion = filtros.medicion === "todos" || lim.estado_medicion === filtros.medicion;

    return matchesBusqueda && matchesUbicacion && matchesConexion && matchesMedicion;
  });

  const isSelected = (lim: LimnigrafoResponse) => selectedLimnigrafo?.id === lim.id;

  return (
    <aside className="absolute top-4 right-4 z-1000 w-80 max-h-[calc(100%-2rem)] flex flex-col rounded-shape-lg bg-background-paper/95 backdrop-blur-md shadow-card border border-border">
      <div className="p-4 pb-0 flex flex-col gap-3 min-w-0">
        <h2 className="text-xl font-semibold text-foreground-title">Limnígrafos</h2>
        <LimnigrafosMapaPanel filtros={filtros} onChange={handleFiltroChange} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-4 pt-3 space-y-2 min-w-0">
        {limnigrafos.length === 0 ? (
          <p className="text-center text-sm text-foreground-secondary mt-8">
            Aún no hay limnígrafos cargados en el sistema.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-sm text-foreground-secondary mt-8">
            No se encontraron limnígrafos con los filtros actuales.
          </p>
        ) : (
          filtrados.map((lim) => (
            <div
              key={lim.id}
              className={`w-full min-w-0 rounded-shape-md border-2 transition-all ${
                isSelected(lim) ? "border-primary bg-primary-light/10 shadow-sm" : "border-transparent hover:border-border"
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectLimnigrafo(lim)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectLimnigrafo(lim);
                }}
                className="w-full min-w-0 text-left p-2.5 focus:outline-none flex items-center gap-2.5 hover:bg-hover rounded-shape-md cursor-pointer"
              >
                <div className="flex items-center justify-center shrink-0">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
                    style={{ backgroundColor: getColor(lim) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground-title leading-tight truncate" title={lim.codigo}>
                    {lim.codigo}
                  </h3>
                  <p
                    className="text-xs text-foreground-secondary truncate"
                    title={lim.ubicacion?.nombre || "Desconocida"}
                  >
                    Ubicación: {lim.ubicacion?.nombre || "Desconocida"}
                  </p>
                </div>
                <div className="text-[10px] text-foreground-secondary border-l border-border pl-2 flex flex-col justify-center shrink-0">
                  {tieneUbicacion(lim) ? (
                    <>
                      <div>alt: {lim.ultima_medicion?.altura_agua ?? "0.0"}</div>
                      <div>x: {lim.ubicacion!.geometry.coordinates[1].toFixed(1)}</div>
                      <div>y: {lim.ubicacion!.geometry.coordinates[0].toFixed(1)}</div>
                    </>
                  ) : (
                    <div className="text-warn italic">Sin coords</div>
                  )}
                </div>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <LimnigrafoMapaMenu
                    limnigrafo={lim}
                    tieneUbicacion={tieneUbicacion(lim)}
                    onMoverUbicacion={(l) => onMoverUbicacion?.(l)}
                    onEditarUbicacion={(l) => setEditandoUbicacion(l)}
                    onVerEnMapa={(l) => onVerEnMapa?.(l)}
                    onQuitarUbicacion={(l) => setQuitandoUbicacion(l)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <VentanaEditarMapaUbicacion
        key={editandoUbicacion?.ubicacion?.id ?? "sin-editar"}
        isOpen={editandoUbicacion !== null}
        onClose={() => setEditandoUbicacion(null)}
        ubicacion={editandoUbicacion?.ubicacion ?? null}
      />

      <VentanaEliminarMapaUbicacion
        isOpen={quitandoUbicacion !== null}
        onClose={() => setQuitandoUbicacion(null)}
        limnigrafo={quitandoUbicacion}
      />
    </aside>
  );
}

export default LimnigrafosMapaSidebar;
