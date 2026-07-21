import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type {
  LimnigrafoResponse,
  PaginatedLimnigrafoResponse,
  ConfiguracionLimnigrafoResponse,
  ConfiguracionLimnigrafoPayload,
} from "@models";

export type LimnigrafoCreateInput = {
  codigo: string;
  memoria?: number | null;
  tipo_comunicacion: string[];
  radio_cobertura_metros?: number | null;
};

export type LimnigrafoUpdateInput = {
  codigo: string;
  descripcion: string;
  ultimo_mantenimiento?: string | null;
  tipo_comunicacion: string[];
  memoria?: number | null;
  radio_cobertura_metros?: number | null;
};

// ---------------------------
// QUERIES
// ---------------------------
export function useGetLimnigrafos(initialData?: PaginatedLimnigrafoResponse) {
  return useQuery({
    queryKey: ["limnigrafos"],
    queryFn: () =>
      RequestClient<PaginatedLimnigrafoResponse>("limnigrafos", {
        queryParams: { limit: 9999 },
      }),
    initialData,
  });
}

// ---------------------------
// MUTATIONS
// ---------------------------
export function usePostLimnigrafo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LimnigrafoCreateInput) =>
      RequestClient<LimnigrafoResponse>("limnigrafos", undefined, {
        method: "POST",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limnigrafos"] });
    },
  });
}

export function usePutLimnigrafo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LimnigrafoUpdateInput }) =>
      RequestClient<LimnigrafoResponse>(`limnigrafos/${id}`, undefined, {
        method: "PUT",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limnigrafos"] });
    },
  });
}

export function useDeleteLimnigrafo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      RequestClient<void>(`limnigrafos/${id}`, undefined, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limnigrafos"] });
    },
  });
}

export function usePatchConfiguracionLimnigrafo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConfiguracionLimnigrafoPayload> }) =>
      RequestClient<ConfiguracionLimnigrafoResponse>(`limnigrafos/${id}/configuracion`, undefined, {
        method: "PATCH",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["limnigrafos"] });
    },
  });
}
