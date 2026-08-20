"use client";

/**
 * Puerto rápido de `shared/componentes/MapView.tsx` del frontend legacy.
 * Objetivo: que la pantalla de mapa funcione end-to-end; no está prolijo
 * ni sigue todavía la arquitectura de primitivas propuesta en
 * docs/roadmaps/roadmap-mapa.md (eso es una fase posterior).
 *
 * Simplificación respecto al legacy: `LimnigrafoResponse` de este proyecto ya
 * trae `ultima_medicion` embebida, así que no hace falta pedir mediciones por
 * separado ni mergear manualmente (el legacy sí lo hacía con useGetMediciones
 * + transformarLimnigrafos).
 */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMapEvents } from "react-leaflet";
import { Mapa, MapaCapaBase, MapaControlZoom, MapaMarcador, MapaTooltip, MapaCirculo } from "./leaflet-primitivas";
import { CardInfoLimnigrafoMapa } from "../mapa/card-info-limnigrafo-mapa";
import { LimnigrafosMapaSidebar } from "./limnigrafos-mapa-sidebar";
import { LimnigrafosMapaSidebarMobile } from "./limnigrafos-mapa-sidebar-mobile";
import { BotonIcono } from "../ui/botones";
import { SegmentedControl } from "../ui/segmented-control";
import { IconifyIcon } from "../ui/iconify-icon";
import { useGetLimnigrafos, useCrearUbicacion, usePatchLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import { tieneCoberturaAlertas, formatearMedicion } from "@utils";
import type { LimnigrafoResponse, PaginatedLimnigrafoResponse } from "@models";

const DEFAULT_CENTER: [number, number] = [-54.79930469196583, -68.30601485928138];

const ESTADO_CONEXION_COLOR: Record<string, string> = {
  en_linea: "#82d987",
  demorado: "#facc15",
};
const COLOR_SIN_CONEXION_ALERTA = "#ef4444";
const COLOR_NEUTRAL = "#9ca3af";

function getColorMarcador(limnigrafo: LimnigrafoResponse): string {
  if (ESTADO_CONEXION_COLOR[limnigrafo.estado_conexion]) {
    return ESTADO_CONEXION_COLOR[limnigrafo.estado_conexion];
  }
  if (limnigrafo.estado_conexion === "sin_conexion") {
    return tieneCoberturaAlertas(limnigrafo.tipo_comunicacion) ? COLOR_SIN_CONEXION_ALERTA : COLOR_NEUTRAL;
  }
  return COLOR_NEUTRAL;
}

function tieneCoordenadas(
  limnigrafo: LimnigrafoResponse
): limnigrafo is LimnigrafoResponse & { ubicacion: NonNullable<LimnigrafoResponse["ubicacion"]> } {
  return Boolean(limnigrafo.ubicacion?.geometry?.coordinates);
}

/** `ubicacion.geometry.coordinates` viene en orden GeoJSON `[longitud, latitud]`; Leaflet espera `[lat, lng]`. */
function coordenadasLatLng(ubicacion: NonNullable<LimnigrafoResponse["ubicacion"]>): [number, number] {
  const [longitud, latitud] = ubicacion.geometry.coordinates;
  return [latitud, longitud];
}

type MapClickEvent = { latlng: { lat: number; lng: number } };

/**
 * Captura clicks en el mapa mientras se está ubicando un limnígrafo (cambia el
 * cursor) y va informando la posición del puntero para el cartel de ayuda.
 *
 * A propósito no escucha `mouseout`: al salirse del mapa queda la última
 * coordenada leída en lugar de vaciarse, que es lo que hacía saltar el cartel.
 */
function MapaClickHandler({
  onClick,
  onMover,
  active,
}: {
  onClick: (_e: MapClickEvent) => void;
  onMover: (_coordenadas: { lat: number; lng: number }) => void;
  active: boolean;
}) {
  const map = useMapEvents({
    click: (e) => {
      if (active) onClick(e);
    },
    mousemove: (e) => {
      if (active) onMover({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (active) {
      const container = map.getContainer();
      const oldCursor = container.style.cursor;
      container.style.cursor = "crosshair";
      return () => {
        container.style.cursor = oldCursor;
      };
    }
  }, [map, active]);

  return null;
}

/** Mueve la cámara del mapa cuando cambia `center`. */
function MapaCambiarVista({ center }: { center: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

export interface MapaScreenProps {
  initialData?: PaginatedLimnigrafoResponse;
}

export function MapaScreen({ initialData }: MapaScreenProps) {
  const searchParams = useSearchParams();
  const mensajes = useMensajes();
  const limnigrafoParam = searchParams.get("limnigrafo");
  const modoParam = searchParams.get("modo");

  const [mapStyle, setMapStyle] = useState<"claro" | "satelite">("claro");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [acordeonAbierto, setAcordeonAbierto] = useState(false);
  const [restaurarAcordeonAlCerrarTarjeta, setRestaurarAcordeonAlCerrarTarjeta] = useState(false);
  const [placementMode, setPlacementMode] = useState<LimnigrafoResponse | null>(null);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [punteroCoords, setPunteroCoords] = useState<{ lat: number; lng: number } | null>(null);
  const initialSelectionAppliedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useGetLimnigrafos(initialData);
  const crearUbicacion = useCrearUbicacion();
  const patchLimnigrafo = usePatchLimnigrafo();

  const limnigrafos = useMemo(() => data?.results ?? [], [data]);
  const [selectedLimnigrafo, setSelectedLimnigrafo] = useState<LimnigrafoResponse | null>(null);
  const [cameraCenter, setCameraCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const hasLimnigrafos = limnigrafos.length > 0;

  const markers = useMemo(() => limnigrafos.filter(tieneCoordenadas), [limnigrafos]);

  useEffect(() => {
    if (markers.length > 0 && cameraCenter === DEFAULT_CENTER) {
      setCameraCenter(coordenadasLatLng(markers[0].ubicacion));
    }
  }, [markers, cameraCenter]);

  useEffect(() => {
    if (initialSelectionAppliedRef.current || !limnigrafoParam || limnigrafos.length === 0) return;

    const limnigrafoSeleccionado = limnigrafos.find((l) => String(l.id) === limnigrafoParam);
    if (!limnigrafoSeleccionado) return;

    initialSelectionAppliedRef.current = true;
    setSelectedLimnigrafo(limnigrafoSeleccionado);

    if (tieneCoordenadas(limnigrafoSeleccionado)) {
      setCameraCenter(coordenadasLatLng(limnigrafoSeleccionado.ubicacion));
    }

    if (modoParam === "ubicacion") {
      setPlacementMode(limnigrafoSeleccionado);
    }
  }, [limnigrafoParam, limnigrafos, modoParam]);

  useEffect(() => {
    if (!selectedLimnigrafo) return;
    const actualizado = limnigrafos.find((l) => l.id === selectedLimnigrafo.id) ?? null;
    if (!actualizado) {
      setSelectedLimnigrafo(null);
      return;
    }
    if (actualizado !== selectedLimnigrafo) {
      setSelectedLimnigrafo(actualizado);
    }
  }, [limnigrafos, selectedLimnigrafo]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error al activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleEditUbicacion = useCallback((lim: LimnigrafoResponse) => {
    setPlacementMode(lim);
    setTempMarker(null);
    setPunteroCoords(null);
  }, []);

  const handleAcordeonChange = useCallback((abierto: boolean) => {
    setAcordeonAbierto(abierto);
    if (abierto) setSelectedLimnigrafo(null);
    setRestaurarAcordeonAlCerrarTarjeta(false);
  }, []);

  const handleSeleccionarLimnigrafo = useCallback((lim: LimnigrafoResponse) => {
    setSelectedLimnigrafo(lim);
    if (tieneCoordenadas(lim)) {
      setCameraCenter(coordenadasLatLng(lim.ubicacion));
    }
    if (window.matchMedia("(max-width: 767px)").matches) {
      setRestaurarAcordeonAlCerrarTarjeta(false);
      return;
    }
    setRestaurarAcordeonAlCerrarTarjeta(acordeonAbierto);
    setAcordeonAbierto(false);
  }, [acordeonAbierto]);

  const handleCerrarTarjeta = useCallback(() => {
    setSelectedLimnigrafo(null);
    if (restaurarAcordeonAlCerrarTarjeta) setAcordeonAbierto(true);
    setRestaurarAcordeonAlCerrarTarjeta(false);
  }, [restaurarAcordeonAlCerrarTarjeta]);

  const handleCancelPlacement = useCallback(() => {
    setPlacementMode(null);
    setTempMarker(null);
    setPunteroCoords(null);
  }, []);

  const handleMapClickForPlacement = useCallback(
    async (e: MapClickEvent) => {
      if (!placementMode) return;
      const { lat, lng } = e.latlng;
      setTempMarker({ lat, lng });

      try {
        const ubicacion = await crearUbicacion.mutateAsync({
          latitud: lat,
          longitud: lng,
          nombre: `Ubicación ${placementMode.codigo}`,
        });
        await patchLimnigrafo.mutateAsync({ id: String(placementMode.id), data: { ubicacion_id: ubicacion.id } });
        mensajes.success("Ubicación guardada", `Se actualizó la ubicación de ${placementMode.codigo}.`);
        setPlacementMode(null);
        setTempMarker(null);
        setPunteroCoords(null);
      } catch (err) {
        mensajes.error(
          "Error al guardar la ubicación",
          err instanceof Error ? err.message : "Ocurrió un error inesperado."
        );
        setTempMarker(null);
      }
    },
    [placementMode, crearUbicacion, patchLimnigrafo, mensajes]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-background">
      <div className="relative h-full w-full">
        <Mapa center={cameraCenter} zoom={15} className="h-full w-full">
          <MapaClickHandler
            onClick={handleMapClickForPlacement}
            onMover={setPunteroCoords}
            active={!!placementMode}
          />
          <MapaCambiarVista center={cameraCenter} />

          {mapStyle === "claro" ? (
            <MapaCapaBase
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://carto.com/'>CARTO</a>"
            />
          ) : (
            <MapaCapaBase
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          )}

          <MapaControlZoom position="bottom-4 left-4" />

          {tempMarker && (
            <MapaMarcador position={[tempMarker.lat, tempMarker.lng]}>
              <MapaTooltip permanent>Guardando...</MapaTooltip>
            </MapaMarcador>
          )}

          {markers.map((limnigrafo) => {
            const color = getColorMarcador(limnigrafo);
            const posicion = coordenadasLatLng(limnigrafo.ubicacion);
            return (
              <Fragment key={limnigrafo.id}>
                {limnigrafo.radio_cobertura_metros && limnigrafo.radio_cobertura_metros > 0 ? (
                  <MapaCirculo
                    center={posicion}
                    radius={limnigrafo.radio_cobertura_metros}
                    pathOptions={{
                      color,
                      weight: selectedLimnigrafo?.id === limnigrafo.id ? 3 : 2,
                      opacity: 0.55,
                      fillColor: color,
                      fillOpacity: selectedLimnigrafo?.id === limnigrafo.id ? 0.22 : 0.14,
                    }}
                  />
                ) : null}
                <MapaMarcador
                  position={posicion}
                  iconAnchor={[12, 12]}
                  eventHandlers={{ click: () => handleSeleccionarLimnigrafo(limnigrafo) }}
                  icon={
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform ${
                        selectedLimnigrafo?.id === limnigrafo.id ? "ring-4 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  }
                >
                  <MapaTooltip>
                    {limnigrafo.codigo}
                    {limnigrafo.radio_cobertura_metros ? ` - Cobertura ${limnigrafo.radio_cobertura_metros} m` : ""}
                  </MapaTooltip>
                </MapaMarcador>
              </Fragment>
            );
          })}
        </Mapa>

        {/* Controles inferiores, separados del zoom de Leaflet. */}
        <div className="absolute left-1/2 top-4 z-1000 flex -translate-x-1/2 gap-3 md:bottom-4 md:left-24 md:top-auto md:translate-x-0">
          <div className="rounded-shape-md border border-border bg-background-paper shadow-md">
            <BotonIcono
              icon={isFullscreen ? "salirPantallaCompleta" : "pantallaCompleta"}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            />
          </div>

          <SegmentedControl
            options={[
              { value: "claro", label: "Mapa" },
              { value: "satelite", label: "Satélite" },
            ]}
            value={mapStyle}
            onChange={(val) => setMapStyle(val as "claro" | "satelite")}
            className="shadow-md bg-background-paper"
          />
        </div>

        {/* Banner de modo edición de ubicación */}
        {placementMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1002 flex items-start gap-3 rounded-shape-lg bg-primary px-5 py-2.5 text-primary-contrast shadow-lg">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                Hacé click en el mapa para ubicar <strong>{placementMode.codigo}</strong>
              </span>
              <span className="text-xs font-normal tabular-nums opacity-90">
                {punteroCoords
                  ? `X: ${punteroCoords.lng.toFixed(5)}  Y: ${punteroCoords.lat.toFixed(5)}`
                  : "Movés el mouse sobre el mapa y acá van las coordenadas"}
              </span>
              {placementMode.ultima_medicion?.altura_agua != null && (
                <span className="text-xs font-normal tabular-nums opacity-90">
                  Altura: {formatearMedicion(placementMode.ultima_medicion.altura_agua, "altura_agua")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCancelPlacement}
              aria-label="Cancelar"
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <IconifyIcon variant="cancelar" className="text-base" />
            </button>
          </div>
        )}

        {!placementMode && (
          <CardInfoLimnigrafoMapa limnigrafo={selectedLimnigrafo} onClose={handleCerrarTarjeta} />
        )}

        {!placementMode && (
          <>
            <LimnigrafosMapaSidebar
              limnigrafos={limnigrafos}
              selectedLimnigrafo={selectedLimnigrafo}
              onSelectLimnigrafo={handleSeleccionarLimnigrafo}
              onMoverUbicacion={handleEditUbicacion}
              abierto={acordeonAbierto}
              onAbiertoChange={handleAcordeonChange}
            />
            <LimnigrafosMapaSidebarMobile
              limnigrafos={limnigrafos}
              selectedLimnigrafo={selectedLimnigrafo}
              onSelectLimnigrafo={handleSeleccionarLimnigrafo}
              onMoverUbicacion={handleEditUbicacion}
              abierto={acordeonAbierto}
              onAbiertoChange={handleAcordeonChange}
            />
          </>
        )}

        {isLoading ? (
          <div className="pointer-events-none absolute inset-0 z-1001 flex items-center justify-center">
            <div className="rounded-shape-lg border border-border bg-background-paper/90 px-5 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
              Cargando datos del mapa...
            </div>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="pointer-events-none absolute inset-0 z-1001 flex items-center justify-center">
            <div className="max-w-md rounded-shape-lg border border-error/40 bg-error-light/20 px-5 py-4 text-center text-sm text-error shadow-lg backdrop-blur-sm">
              No se pudieron cargar los limnígrafos del mapa.
            </div>
          </div>
        ) : null}

        {!isLoading && !error && !hasLimnigrafos ? (
          <div className="pointer-events-none absolute inset-0 z-1001 flex items-center justify-center">
            <div className="max-w-md rounded-shape-lg border border-border bg-background-paper/90 px-5 py-4 text-center text-sm text-foreground-secondary shadow-lg backdrop-blur-sm">
              No hay limnígrafos disponibles para mostrar en el mapa.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MapaScreen;
