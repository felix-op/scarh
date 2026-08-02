"use client";

import { useRouter } from "next/navigation";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";
import { Boton } from "../ui/botones";
import { ChipEstadoConexion, ChipEstadoMedicion } from "../limnigrafos/chip-estado-limnigrafo";
import { formatearMedicion } from "@utils";
import type { LimnigrafoResponse } from "@models";

export interface CardInfoLimnigrafoMapaProps {
  limnigrafo: LimnigrafoResponse | null;
  onClose?: () => void;
}

interface FilaDato {
  icon: IconVariants;
  label: string;
  value: string;
}

export function CardInfoLimnigrafoMapa({ limnigrafo, onClose }: CardInfoLimnigrafoMapaProps) {
  const router = useRouter();

  if (!limnigrafo) return null;

  const medicion = limnigrafo.ultima_medicion;
  const coordenadas = limnigrafo.ubicacion?.geometry?.coordinates;

  const ubicacionDetalle = coordenadas ? `X: ${coordenadas[0].toFixed(5)}  Y: ${coordenadas[1].toFixed(5)}` : undefined;

  const filasDispositivo: FilaDato[] = [
    { icon: "bateria", label: "Batería", value: formatearMedicion(limnigrafo.bateria, "nivel_de_bateria") },
  ];

  const filasMedicion: FilaDato[] = [
    { icon: "altura", label: "Altura", value: formatearMedicion(medicion?.altura_agua, "altura_agua") },
    { icon: "presion", label: "Presión", value: formatearMedicion(medicion?.presion, "presion") },
    { icon: "temperatura", label: "Temperatura", value: formatearMedicion(medicion?.temperatura, "temperatura") },
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

        <div className="flex flex-col gap-3 px-4 pb-3">
          <section className="flex flex-col gap-2">
            <span className="text-[10px] font-medium text-foreground-secondary uppercase tracking-wide">
              Dispositivo
            </span>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <IconifyIcon variant="ubicacion" className="text-base text-foreground-secondary" />
                <span className="text-foreground-secondary">Ubicación</span>
              </div>
              <span className="pl-6 font-medium text-foreground">{limnigrafo.ubicacion?.nombre || "Sin ubicación"}</span>
              {ubicacionDetalle && <span className="pl-6 text-xs font-normal text-foreground-secondary">{ubicacionDetalle}</span>}
            </div>
            {filasDispositivo.map((fila) => (
              <div key={fila.label} className="flex items-center gap-2 text-sm">
                <IconifyIcon variant={fila.icon} className="text-base text-foreground-secondary" />
                <span className="w-24 shrink-0 text-foreground-secondary">{fila.label}</span>
                <span className="flex-1 text-right font-medium text-foreground">{fila.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground-secondary">
                <IconifyIcon variant="conexion" className="text-base" />
                Conexión
              </span>
              <ChipEstadoConexion estado={limnigrafo.estado_conexion} tipoComunicacion={limnigrafo.tipo_comunicacion} />
            </div>
          </section>

          <div className="border-t border-dashed border-border/60" />

          <section className="flex flex-col gap-2">
            <span className="text-[10px] font-medium text-foreground-secondary uppercase tracking-wide">
              Última medición
            </span>
            {filasMedicion.map((fila) => (
              <div key={fila.label} className="flex items-center gap-2 text-sm">
                <IconifyIcon variant={fila.icon} className="text-base text-foreground-secondary" />
                <span className="w-24 shrink-0 text-foreground-secondary">{fila.label}</span>
                <span className="flex-1 text-right font-medium text-foreground">{fila.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground-secondary">
                <IconifyIcon variant="estado" className="text-base" />
                Estado
              </span>
              <ChipEstadoMedicion estado={limnigrafo.estado_medicion} />
            </div>
          </section>
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

export default CardInfoLimnigrafoMapa;
