import type { Paginado } from "./backend";

/**
 * `UbicacionSerializer` valida en base a campos planos (POST/PUT/PATCH), pero
 * su `to_representation` siempre devuelve GeoJSON — por eso el shape de
 * lectura y el de escritura son tipos distintos acá.
 * @property {[number, number]} coordinates `[longitud, latitud]` (orden GeoJSON, no `[lat, lng]`).
 */
export type UbicacionResponse = {
  type: "Feature";
  id: number;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  nombre: string | null;
};

export type UbicacionPayload = {
  latitud: number;
  longitud: number;
  nombre: string | null;
};

export type PaginatedUbicacionResponse = Paginado<UbicacionResponse>;
