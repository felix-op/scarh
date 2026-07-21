import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type { RutaAccesoResponse, PaginatedRutaAccesoResponse } from "@models";

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" };

// ---------------------------
// QUERIES
// ---------------------------
export function useGetRutasAcceso(limnigrafoId: number | string) {
  return useQuery({
    queryKey: ["rutas-acceso", String(limnigrafoId)],
    queryFn: () =>
      RequestClient<PaginatedRutaAccesoResponse>("rutas-acceso", {
        queryParams: { limnigrafo: limnigrafoId, limit: 100 },
      }),
    enabled: limnigrafoId !== undefined && limnigrafoId !== null && limnigrafoId !== "",
  });
}

// ---------------------------
// MUTATIONS (multipart/form-data)
// ---------------------------
export function usePostRutaAcceso(limnigrafoId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) =>
      RequestClient<RutaAccesoResponse>("rutas-acceso", undefined, {
        method: "POST",
        data,
        headers: MULTIPART_HEADERS,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas-acceso", String(limnigrafoId)] });
    },
  });
}

export function usePatchRutaAcceso(limnigrafoId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData }) =>
      RequestClient<RutaAccesoResponse>(`rutas-acceso/${id}`, undefined, {
        method: "PATCH",
        data,
        headers: MULTIPART_HEADERS,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas-acceso", String(limnigrafoId)] });
    },
  });
}

export function useDeleteRutaAcceso(limnigrafoId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) =>
      RequestClient<void>(`rutas-acceso/${id}`, undefined, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rutas-acceso", String(limnigrafoId)] });
    },
  });
}
