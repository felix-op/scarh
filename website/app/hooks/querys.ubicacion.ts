import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type { UbicacionResponse, UbicacionPayload } from "@models";

export function useCrearUbicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UbicacionPayload) =>
      RequestClient<UbicacionResponse>("ubicacion", undefined, {
        method: "POST",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubicaciones"] });
    },
  });
}

export function useEditarUbicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UbicacionPayload> }) =>
      RequestClient<UbicacionResponse>(`ubicacion/${id}`, undefined, {
        method: "PATCH",
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ubicaciones"] });
      queryClient.invalidateQueries({ queryKey: ["limnigrafos"] });
    },
  });
}
