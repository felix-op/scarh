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

export interface MedicionImportRowPayload {
  row_number: number;
  limnigrafo_id: number | null;
  fecha_hora: string;
  altura_agua: number | null;
  presion: number | null;
  temperatura: number | null;
  nivel_de_bateria: number | null;
}

export interface MedicionImportPayload {
  file_name: string;
  fuente: FuenteEnum;
  fallback_limnigrafo_id?: number | null;
  rows: MedicionImportRowPayload[];
}

export interface MedicionImportIssue {
  field: string;
  code: string;
  message: string;
}

export type MedicionImportRowStatus = "valid" | "error" | "duplicate_file" | "duplicate_database";

export interface MedicionImportRowResult {
  rowNumber: number;
  limnigrafoId: number | null;
  fechaHora: string;
  alturaAgua: number | null;
  presion: number | null;
  temperatura: number | null;
  nivelBateria: number | null;
  status: MedicionImportRowStatus;
  issues: MedicionImportIssue[];
}

export interface MedicionImportSummary {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
}

export interface MedicionImportValidationResponse {
  file_name: string;
  fuente: string;
  is_valid: boolean;
  summary: MedicionImportSummary;
  rows: MedicionImportRowResult[];
}

export interface MedicionBulkImportResponse {
  message: string;
  imported_rows: number;
  rows: MedicionImportRowResult[];
}
