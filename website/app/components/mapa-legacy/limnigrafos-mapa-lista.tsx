"use client";

/** Contenido compartido (filtros + listado) entre `LimnigrafosMapaSidebar` (desktop) y `LimnigrafosMapaSidebarMobile`. */

import { Fragment, useState } from "react";
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

export interface LimnigrafosMapaListaProps {
  limnigrafos: LimnigrafoResponse[];
  selectedLimnigrafo: LimnigrafoResponse | null;
  onSelectLimnigrafo: (_limnigrafo: LimnigrafoResponse) => void;
  onMoverUbicacion?: (_limnigrafo: LimnigrafoResponse) => void;
  onVerEnMapa?: (_limnigrafo: LimnigrafoResponse) => void;
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

export function LimnigrafosMapaLista({
  limnigrafos,
  selectedLimnigrafo,
  onSelectLimnigrafo,
  onMoverUbicacion,
  onVerEnMapa,
}: LimnigrafosMapaListaProps) {
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
    <>
      <div className="flex flex-col gap-3 px-4 pt-3 min-w-0">
        <LimnigrafosMapaPanel filtros={filtros} onChange={handleFiltroChange} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-4 pt-3 space-y-1 min-w-0">
        {limnigrafos.length === 0 ? (
          <p className="text-center text-sm text-foreground-secondary mt-8">
            Aún no hay limnígrafos cargados en el sistema.
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-sm text-foreground-secondary mt-8">
            No se encontraron limnígrafos con los filtros actuales.
          </p>
        ) : (
          filtrados.map((lim, indice) => (
            <Fragment key={lim.id}>
              <div
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
                  className="w-full min-w-0 text-left p-2.5 focus:outline-none flex flex-col hover:bg-hover rounded-shape-md cursor-pointer"
                >
                  {/* Encabezado: el punto de estado sólo desplaza al código y al label. */}
                  <div className="flex items-start gap-2.5">
                    {/* `mt-1` alinea el punto con la línea del código, no con el alto del bloque. */}
                    <div
                      className="mt-1 w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
                      style={{ backgroundColor: getColor(lim) }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-semibold text-foreground-title leading-tight truncate"
                        title={lim.codigo}
                      >
                        {lim.codigo}
                      </h3>
                      <span className="block text-[10px] font-medium uppercase tracking-wide text-foreground-secondary">
                        Ubicación
                      </span>
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

                  {/* Detalle a ancho completo, por debajo del punto de estado. */}
                  <div className="min-w-0">
                    <p
                      className="text-xs leading-tight text-foreground truncate"
                      title={lim.ubicacion?.nombre || "Desconocida"}
                    >
                      {lim.ubicacion?.nombre || "Desconocida"}
                    </p>
                    {tieneUbicacion(lim) ? (
                      <p className="-mt-0.5 text-[9px] leading-none tabular-nums text-foreground-secondary truncate">
                        X: {lim.ubicacion!.geometry.coordinates[0].toFixed(5)} Y:{" "}
                        {lim.ubicacion!.geometry.coordinates[1].toFixed(5)}
                      </p>
                    ) : (
                      <p className="-mt-0.5 text-[9px] leading-none italic text-warn">Sin coordenadas</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separa un dispositivo del siguiente sin encerrar cada uno en su propia card. */}
              {indice < filtrados.length - 1 && <div className="mx-2.5 h-px bg-border" />}
            </Fragment>
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
    </>
  );
}

export default LimnigrafosMapaLista;
