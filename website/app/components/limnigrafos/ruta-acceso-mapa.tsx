"use client";

import { Fragment, useEffect } from "react";
import { useMap } from "react-leaflet";
import { Mapa, MapaCapaBase, MapaControlZoom, MapaMarcador, MapaPolyline, MapaTooltip } from "../mapa-legacy/leaflet-primitivas";
import type { RutaAccesoResponse } from "@models";
import type { UbicacionResponse } from "@models";

type LatLng = [number, number];

const CENTRO_POR_DEFECTO: LatLng = [-54.79930469196583, -68.30601485928138];

function esCoordenadaValida([lat, lng]: LatLng): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

/** El backend guarda las coordenadas en orden GeoJSON `[lng, lat]`; Leaflet espera `[lat, lng]`. */
function normalizarLineas(ruta: RutaAccesoResponse): LatLng[][] {
  const geometry = ruta.geometria?.features?.[0]?.geometry;
  const coordinates = geometry?.coordinates;
  if (!geometry?.type || !coordinates) return [];

  if (geometry.type === "LineString") {
    const linea = (coordinates as [number, number][])
      .map(([lng, lat]) => [lat, lng] as LatLng)
      .filter(esCoordenadaValida);
    return linea.length >= 2 ? [linea] : [];
  }

  if (geometry.type === "MultiLineString") {
    return (coordinates as [number, number][][])
      .map((segmento) => segmento.map(([lng, lat]) => [lat, lng] as LatLng).filter(esCoordenadaValida))
      .filter((segmento) => segmento.length >= 2);
  }

  return [];
}

function normalizarPuntoGeoJson(punto: unknown): LatLng | null {
  if (!Array.isArray(punto) || punto.length < 2) return null;
  const [lng, lat] = punto as [number, number];
  return esCoordenadaValida([lat, lng]) ? [lat, lng] : null;
}

function normalizarUbicacion(ubicacion?: UbicacionResponse | null): LatLng | null {
  const coordinates = ubicacion?.geometry?.coordinates;
  if (!coordinates) return null;
  const [lng, lat] = coordinates;
  return esCoordenadaValida([lat, lng]) ? [lat, lng] : null;
}

function obtenerExtremosRuta(ruta: RutaAccesoResponse, lineas: LatLng[][]) {
  const puntos = lineas.flat();
  const propiedades = ruta.geometria?.features?.[0]?.properties;

  return {
    inicio: normalizarPuntoGeoJson(propiedades?.start_coordinate) ?? puntos[0] ?? null,
    fin: normalizarPuntoGeoJson(propiedades?.destination_coordinate) ?? puntos[puntos.length - 1] ?? null,
    ultimo: normalizarPuntoGeoJson(propiedades?.end_coordinate) ?? puntos[puntos.length - 1] ?? null,
    esIdaVuelta: Boolean(propiedades?.is_round_trip),
  };
}

/** Encuadra el mapa para que se vea toda la ruta (y la ubicación del limnígrafo si está disponible). */
function AjustarVistaRuta({ lineas, ubicacion }: { lineas: LatLng[][]; ubicacion: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    const puntos = [...lineas.flat()];
    if (ubicacion) puntos.push(ubicacion);

    if (puntos.length >= 2) {
      map.fitBounds(puntos, { padding: [28, 28] });
    } else if (puntos.length === 1) {
      map.setView(puntos[0], 15);
    }
  }, [lineas, map, ubicacion]);

  return null;
}

export interface RutaAccesoMapaProps {
  ruta: RutaAccesoResponse;
  ubicacion?: UbicacionResponse | null;
}

/** Mini-mapa con la traza GPX/KML de una ruta de acceso, sus marcadores de inicio/fin y la ubicación del limnígrafo. */
export function RutaAccesoMapa({ ruta, ubicacion }: RutaAccesoMapaProps) {
  const lineas = normalizarLineas(ruta);
  const ubicacionNormalizada = normalizarUbicacion(ubicacion);
  const { inicio, fin, ultimo, esIdaVuelta } = obtenerExtremosRuta(ruta, lineas);
  const centro = ubicacionNormalizada ?? lineas[0]?.[0] ?? CENTRO_POR_DEFECTO;

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-shape-md border border-border">
      <Mapa center={centro} zoom={14} className="h-full min-h-[360px] w-full">
        <MapaCapaBase />
        <MapaControlZoom position="bottom-4 left-4" />
        <AjustarVistaRuta lineas={lineas} ubicacion={ubicacionNormalizada} />

        {lineas.map((linea, index) => (
          <Fragment key={`${ruta.id}-${index}`}>
            <MapaPolyline positions={linea} pathOptions={{ color: "#FFFFFF", weight: 8, opacity: 1 }} />
            <MapaPolyline positions={linea} pathOptions={{ color: "#0B1F3A", weight: 5, opacity: 0.95 }} />
            <MapaPolyline positions={linea} pathOptions={{ color: "#FBBF24", weight: 3, opacity: 1 }} />
          </Fragment>
        ))}

        {inicio && (
          <MapaMarcador
            position={inicio}
            iconAnchor={[8, 8]}
            icon={<span className="block h-4 w-4 rounded-full border-2 border-white bg-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.35)]" />}
          >
            <MapaTooltip>Inicio de la ruta</MapaTooltip>
          </MapaMarcador>
        )}
        {fin && (
          <MapaMarcador
            position={fin}
            iconAnchor={[9, 9]}
            icon={<span className="block h-[18px] w-[18px] rounded-full border-2 border-white bg-[#F97316] shadow-[0_0_0_4px_rgba(249,115,22,0.35)]" />}
          >
            <MapaTooltip>{esIdaVuelta ? "Destino de la ruta" : "Fin de la ruta"}</MapaTooltip>
          </MapaMarcador>
        )}
        {esIdaVuelta && ultimo && (
          <MapaMarcador
            position={ultimo}
            iconAnchor={[7, 7]}
            icon={<span className="block h-3.5 w-3.5 rounded-full border-2 border-white bg-[#64748B] shadow-[0_0_0_3px_rgba(100,116,139,0.25)]" />}
          >
            <MapaTooltip>Regreso al inicio</MapaTooltip>
          </MapaMarcador>
        )}
        {ubicacionNormalizada && (
          <MapaMarcador
            position={ubicacionNormalizada}
            iconAnchor={[12, 12]}
            icon={<span className="block h-6 w-6 rounded-full border-[3px] border-white bg-[#22C55E] shadow-[0_0_0_5px_rgba(34,197,94,0.35),0_2px_8px_rgba(15,23,42,0.45)]" />}
          >
            <MapaTooltip>Limnígrafo</MapaTooltip>
          </MapaMarcador>
        )}
      </Mapa>
    </div>
  );
}

export default RutaAccesoMapa;
