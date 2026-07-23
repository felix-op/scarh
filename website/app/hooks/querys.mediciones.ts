import { useMutation } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type {
  MedicionImportPayload,
  MedicionImportValidationResponse,
  MedicionBulkImportResponse,
  MedicionResponse,
  PaginatedMedicionResponse,
} from "@models";

export interface FiltrosMedicionesQuery {
  limnigrafo?: string;
  fuente?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}

const TAMANO_PAGINA_EXPORT = 1000;
const MAX_FILAS_EXPORT = 5000;

/**
 * Trae todas las mediciones que coincidan con los filtros aplicados, paginando
 * de a 1000 (el máximo del backend), hasta un total de 5000 filas para evitar
 * exportaciones descontroladamente grandes. Usado por los botones de exportar.
 */
export async function obtenerTodasLasMedicionesFiltradas(
  filtros: FiltrosMedicionesQuery
): Promise<{ rows: MedicionResponse[]; truncado: boolean }> {
  let page = 1;
  let total = Infinity;
  const rows: MedicionResponse[] = [];

  while (rows.length < total && rows.length < MAX_FILAS_EXPORT) {
    const data = await RequestClient<PaginatedMedicionResponse>("mediciones", {
      queryParams: { ...filtros, page, limit: TAMANO_PAGINA_EXPORT },
    });
    rows.push(...data.results);
    total = data.count;
    if (data.results.length === 0) break;
    page += 1;
  }

  return { rows: rows.slice(0, MAX_FILAS_EXPORT), truncado: total > MAX_FILAS_EXPORT };
}

// ---------------------------
// MUTATIONS
// ---------------------------
export function useValidarImportacionMediciones() {
  return useMutation({
    mutationFn: (data: MedicionImportPayload) =>
      RequestClient<MedicionImportValidationResponse>("mediciones/validate-import", undefined, {
        method: "POST",
        data,
      }),
  });
}

export function useImportarMediciones() {
  return useMutation({
    mutationFn: (data: MedicionImportPayload) =>
      RequestClient<MedicionBulkImportResponse>("mediciones/bulk-import", undefined, {
        method: "POST",
        data,
      }),
  });
}
