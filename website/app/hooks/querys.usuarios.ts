import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequestClient } from "@services";
import type {
  UsuarioResponse,
  UsuarioPostRequest,
  UsuarioPutRequest,
  UsuarioRolesPutRequest,
  PaginatedResponse
} from "@models";

// ---------------------------
// QUERIES
// ---------------------------
export function useGetUsuarios(initialData?: PaginatedResponse<UsuarioResponse>) {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: () => {
      return RequestClient<PaginatedResponse<UsuarioResponse>>("usuarios", {
        queryParams: { limit: 9999 },
      });
    },
    initialData,
  });
}

// ---------------------------
// MUTATIONS
// ---------------------------
export function usePostUsuario() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UsuarioPostRequest) => 
      RequestClient<UsuarioResponse>("usuarios", undefined, { 
        method: "POST", 
        data 
      }),
    onSuccess: () => {
      // Al crear, invalidamos la lista para que se actualice la tabla
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function usePutUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UsuarioPutRequest }) =>
      RequestClient<UsuarioResponse>(`usuarios/${id}`, undefined, {
        method: "PUT",
        data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      RequestClient<void>(`usuarios/${id}`, undefined, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function usePutUsuarioRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) => {
      const data: UsuarioRolesPutRequest = { roles };
      return RequestClient<UsuarioResponse>(`usuarios/${id}/roles`, undefined, {
        method: "PUT",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function usePutUsuariosRolesMasivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; roles: string[] }[]) =>
      Promise.all(
        items.map(({ id, roles }) => {
          const data: UsuarioRolesPutRequest = { roles };
          return RequestClient<UsuarioResponse>(`usuarios/${id}/roles`, undefined, {
            method: "PUT",
            data,
          });
        })
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
