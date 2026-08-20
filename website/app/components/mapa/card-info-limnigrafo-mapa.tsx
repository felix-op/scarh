"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";
import { Boton } from "../ui/botones";
import { VentanaInfo } from "../ui/modals";
import { ChipEstadoConexion, ChipEstadoMedicion } from "../limnigrafos/chip-estado-limnigrafo";
import { formatearMedicion, formatearBateria } from "@utils";
import type { LimnigrafoResponse } from "@models";

export interface CardInfoLimnigrafoMapaProps {
  limnigrafo: LimnigrafoResponse | null;
  onClose: () => void;
}

interface FilaDato {
  icon: IconVariants;
  label: string;
  value: string;
}

export function CardInfoLimnigrafoMapa({ limnigrafo, onClose }: CardInfoLimnigrafoMapaProps) {
  const router = useRouter();
  const [esMovil, setEsMovil] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const actualizarEsMovil = (event: MediaQueryListEvent) => setEsMovil(event.matches);

    mediaQuery.addEventListener("change", actualizarEsMovil);
    return () => mediaQuery.removeEventListener("change", actualizarEsMovil);
  }, []);

  if (!limnigrafo) return null;

  const medicion = limnigrafo.ultima_medicion;
  const coordenadas = limnigrafo.ubicacion?.geometry?.coordinates;

  const ubicacionDetalle = coordenadas ? `X: ${coordenadas[0].toFixed(5)}  Y: ${coordenadas[1].toFixed(5)}` : undefined;

  const filasDispositivo: FilaDato[] = [
    { icon: "bateria", label: "Batería", value: formatearBateria(limnigrafo.bateria, limnigrafo.configuracion) },
  ];

  const filasMedicion: FilaDato[] = [
    { icon: "altura", label: "Altura", value: formatearMedicion(medicion?.altura_agua, "altura_agua") },
    { icon: "presion", label: "Presión", value: formatearMedicion(medicion?.presion, "presion") },
    { icon: "temperatura", label: "Temperatura", value: formatearMedicion(medicion?.temperatura, "temperatura") },
  ];

  const contenido = (
    <>
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
    </>
  );

  if (esMovil) {
    return (
      <VentanaInfo open handleClose={onClose} title={`Datos de ${limnigrafo.codigo}`} icon="chip">
        {contenido}
      </VentanaInfo>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-1001 hidden w-[320px] md:block">
      <div className="rounded-shape-lg border border-border bg-background-paper shadow-card">
        <header className="relative px-4 pb-2 pt-3 text-center">
          <h3 className="text-base font-semibold text-foreground-title">Datos de {limnigrafo.codigo}</h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-foreground-secondary transition-colors hover:text-foreground"
            aria-label="Cerrar panel"
          >
            <IconifyIcon variant="cancelar" className="text-sm" />
          </button>
        </header>
        {contenido}
      </div>
    </div>
  );
}

export default CardInfoLimnigrafoMapa;
