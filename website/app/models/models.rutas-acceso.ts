import type { Paginado } from "./backend";

/**
 * GeoJSON simplificado devuelto por el backend para las trazas de rutas de acceso.
 * Sólo se tipa lo que consume el frontend; el detalle geométrico queda como `unknown`.
 */
export type RutaAccesoGeometria = {
  type?: string;
  features?: {
    type?: string;
    geometry?: {
      type?: string;
      coordinates?: unknown;
    };
    properties?: Record<string, unknown>;
  }[];
};

export type RutaAccesoResponse = {
  id: number;
  limnigrafo: number;
  nombre: string;
  formato_origen: "gpx" | "kml";
  tiempo_estimado_minutos: number | null;
  distancia_km: number | null;
  observaciones: string;
  archivo_nombre: string | null;
  archivo_url: string | null;
  geometria: RutaAccesoGeometria | null;
  creado_en: string;
  actualizado_en: string;
};

/**
 * Payload de creación/edición de una ruta de acceso. Se envía como `multipart/form-data`
 * porque incluye el archivo `archivo_original` (GPX/KML). `formato_origen`, `distancia_km`
 * y `geometria` los deriva el backend a partir del archivo.
 */
export type RutaAccesoPayload = {
  limnigrafo_id: number;
  nombre: string;
  observaciones?: string;
  tiempo_estimado_minutos?: number | null;
  archivo_original?: File;
};

export type PaginatedRutaAccesoResponse = Paginado<RutaAccesoResponse>;
