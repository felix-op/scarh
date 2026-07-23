"use client";

/** Puerto rápido de `shared/componentes/LimnigrafoMapInfoPanel.tsx` (legacy). */

import { useRouter } from "next/navigation";
import { IconifyIcon } from "../ui/iconify-icon";
import { Boton } from "../ui/botones";
import { ChipEstadoConexion, ChipEstadoMedicion } from "../limnigrafos/chip-estado-limnigrafo";
import type { LimnigrafoResponse } from "@models";

interface LimnigrafoMapaInfoPanelProps {
  limnigrafo: LimnigrafoResponse | null;
  onClose?: () => void;
}

function formatValor(valor: number | null | undefined, unidad: string): string {
  return valor != null ? `${valor} ${unidad}` : "-";
}

export function LimnigrafoMapaInfoPanel({ limnigrafo, onClose }: LimnigrafoMapaInfoPanelProps) {
  const router = useRouter();

  if (!limnigrafo) return null;

  const medicion = limnigrafo.ultima_medicion;

  const filas = [
    { label: "Código", value: limnigrafo.codigo },
    { label: "Ubicación", value: limnigrafo.ubicacion?.nombre || "Sin ubicación" },
    { label: "Altura", value: formatValor(medicion?.altura_agua, "m") },
    { label: "Batería", value: formatValor(limnigrafo.bateria, "V") },
    { label: "Presión", value: formatValor(medicion?.presion, "hPa") },
    { label: "Temperatura", value: formatValor(medicion?.temperatura, "°C") },
  ];

  return (
    <div className="absolute left-4 bottom-4 z-1001 w-[320px]">
      <div className="rounded-shape-lg bg-background-paper shadow-card border border-border">
        <header className="relative px-4 pb-2 pt-3 text-center">
          <h3 className="text-base font-semibold text-foreground-title">Datos de {limnigrafo.codigo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-foreground-secondary hover:text-foreground transition-colors"
            aria-label="Cerrar panel"
          >
            <IconifyIcon variant="cancelar" className="text-sm" />
          </button>
        </header>

        <div className="px-3">
          <div className="grid grid-cols-2 border-b border-border px-3 py-1.5 text-center text-[10px] font-medium text-foreground-secondary uppercase tracking-wide">
            <span>Elemento</span>
            <span>Dato</span>
          </div>
          {filas.map((fila) => (
            <div
              key={fila.label}
              className="grid grid-cols-2 items-center gap-2 border-b border-dashed border-border/60 px-3 py-1.5 text-center text-sm font-semibold text-foreground"
            >
              <span className="text-foreground-secondary font-medium">{fila.label}</span>
              <span>{fila.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 px-3 py-2">
            <ChipEstadoConexion estado={limnigrafo.estado_conexion} tipoComunicacion={limnigrafo.tipo_comunicacion} />
            <ChipEstadoMedicion estado={limnigrafo.estado_medicion} />
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-3">
          <Boton
            content="Ver más"
            className="w-full"
            onClick={() => router.push(`/dashboard/limnigrafos/datos/${limnigrafo.id}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default LimnigrafoMapaInfoPanel;
