"use client";

import { BotonIconoEditar, BotonIconoEliminar, BotonIcono } from "../ui/botones";
import { formatFecha } from "@utils";
import type { RutaAccesoResponse } from "@models";

export interface RutaAccesoCardProps {
  ruta: RutaAccesoResponse;
  puedeEditar: boolean;
  onEditar: (ruta: RutaAccesoResponse) => void;
  onEliminar: (ruta: RutaAccesoResponse) => void;
}

/** Tarjeta de una ruta de acceso con acciones descargar / editar / eliminar. */
export function RutaAccesoCard({ ruta, puedeEditar, onEditar, onEliminar }: RutaAccesoCardProps) {
  const descargar = () => {
    const a = document.createElement("a");
    a.href = `/api/rutas-acceso/${ruta.id}/descargar`;
    a.download = ruta.archivo_nombre || `ruta-${ruta.id}.${ruta.formato_origen}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const detalle = [
    ruta.tiempo_estimado_minutos != null ? `${ruta.tiempo_estimado_minutos} min` : "Sin tiempo estimado",
    ruta.distancia_km != null ? `${ruta.distancia_km} km` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex items-start justify-between gap-4 rounded-shape-md border border-border bg-background-paper p-4">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">{ruta.nombre}</span>
          <span className="shrink-0 rounded-shape-sm bg-background-muted px-2 py-0.5 text-xs font-medium text-foreground-secondary uppercase">
            {ruta.formato_origen}
          </span>
        </div>
        <span className="text-sm text-foreground-secondary">{detalle}</span>
        {ruta.observaciones && (
          <p className="text-sm text-foreground-secondary line-clamp-2">{ruta.observaciones}</p>
        )}
        <span className="text-xs text-foreground-disabled">Cargada el {formatFecha(ruta.creado_en)}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <BotonIcono icon="descargar" onClick={descargar} />
        {puedeEditar && (
          <>
            <BotonIconoEditar onClick={() => onEditar(ruta)} />
            <BotonIconoEliminar onClick={() => onEliminar(ruta)} />
          </>
        )}
      </div>
    </div>
  );
}

export default RutaAccesoCard;
