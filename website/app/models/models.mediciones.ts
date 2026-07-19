import type { Paginado } from "./backend";

export type FuenteEnum = "manual" | "automatico" | "import_csv" | "import_json";

export type MedicionResponse = {
  id: number;
  fecha_hora: string;
  altura_agua: number;
  presion: number | null;
  temperatura: number | null;
  nivel_de_bateria: number | null;
  fuente: FuenteEnum;
  limnigrafo: number | null;
};

export type MedicionPayload = Omit<MedicionResponse, "id">;

export type PaginatedMedicionResponse = Paginado<MedicionResponse>;
