import type { Paginado } from "./backend";

export type UbicacionResponse = {
  id: number;
  longitud: number;
  latitud: number;
  nombre: string | null;
};

export type UbicacionPayload = Omit<UbicacionResponse, "id">;

export type PaginatedUbicacionResponse = Paginado<UbicacionResponse>;
