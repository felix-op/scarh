import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type {
  AlertaResponse,
  EstadoEnum,
  MarcarTodasLeidasResponse,
  PaginatedAlertaResponse,
} from "@models";

/** Cantidad de alertas que muestra la ventana de notificaciones. */
const LIMITE_RECIENTES = 10;

/**
 * Últimas alertas del usuario, para la ventana de notificaciones.
 *
 * Va por `RequestClient` y no por SSR a propósito: la ventana se abre y se
 * actualiza sin navegar, así que necesita la caché de TanStack Query. El listado
 * de `/dashboard/alertas` sí usa SSR.
 */
export function useAlertasRecientes(habilitada = true) {
  return useQuery({
    queryKey: ["alertas", "recientes"],
    queryFn: () =>
      RequestClient<PaginatedAlertaResponse>("alertas", {
        queryParams: { limit: LIMITE_RECIENTES, page: 1, ordering: "-fecha_hora" },
      }),
    enabled: habilitada,
  });
}

/**
 * Cuántas alertas sin leer tiene el usuario.
 *
 * Pide `limit=1` y se queda con el `count` de la respuesta paginada: no hace falta
 * un endpoint aparte y evita traer diez filas para mostrar un número.
 */
export function useConteoAlertasNoLeidas() {
  return useQuery({
    queryKey: ["alertas", "no-leidas"],
    queryFn: async () => {
      const data = await RequestClient<PaginatedAlertaResponse>("alertas", {
        queryParams: { leida: false, limit: 1, page: 1 },
      });
      return data.count;
    },
  });
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      RequestClient<MarcarTodasLeidasResponse>("alertas/mark-all-read", undefined, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
    },
  });
}

/**
 * Marca una alerta como leída.
 *
 * El `id` es el de la `UsuarioNotificacion`, **no** el de `alerta_id`: el estado de
 * lectura es por usuario. Actualiza de forma optimista para que el resalte de "no
 * leída" se apague en el momento del click y no cuando conteste el servidor.
 */
export function useMarcarAlertaLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      RequestClient<AlertaResponse, Record<string, never>, { estado: EstadoEnum }>(
        `alertas/${id}`,
        undefined,
        { method: "PATCH", data: { estado: "leido" } }
      ),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["alertas"] });
      const previas = queryClient.getQueryData<PaginatedAlertaResponse>(["alertas", "recientes"]);
      const conteoPrevio = queryClient.getQueryData<number>(["alertas", "no-leidas"]);

      if (previas) {
        queryClient.setQueryData<PaginatedAlertaResponse>(["alertas", "recientes"], {
          ...previas,
          results: previas.results.map((alerta) =>
            alerta.id === id ? { ...alerta, estado: "leido" } : alerta
          ),
        });
      }
      if (typeof conteoPrevio === "number") {
        queryClient.setQueryData<number>(["alertas", "no-leidas"], Math.max(0, conteoPrevio - 1));
      }

      return { previas, conteoPrevio };
    },
    onError: (_error, _variables, context) => {
      if (context?.previas) {
        queryClient.setQueryData(["alertas", "recientes"], context.previas);
      }
      if (typeof context?.conteoPrevio === "number") {
        queryClient.setQueryData(["alertas", "no-leidas"], context.conteoPrevio);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
    },
  });
}
