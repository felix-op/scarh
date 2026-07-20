"use client";

import { VentanaConfirmar } from "../ui/modals";
import type { UsuarioResponse } from "@models";
import { useDeleteUsuario } from "@hooks";
import { useMensajes } from "@services";

export interface VentanaEliminarUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
}

export function VentanaEliminarUsuario({
  open,
  onClose,
  usuario,
}: VentanaEliminarUsuarioProps) {
  const mensajes = useMensajes();
  const { mutate: eliminarUsuario, isPending } = useDeleteUsuario();

  const onConfirm = () => {
    if (!usuario?.id) return;

    eliminarUsuario(String(usuario.id), {
      onSuccess: () => {
        mensajes.success("Eliminado Correctamente", `El usuario ${usuario.nombre_usuario} se eliminó correctamente`);
      },
      onError: (error: Error) => {
        mensajes.error("Error al eliminar", error.message || `El usuario ${usuario.nombre_usuario} no se pudo eliminar`);
      },
      onSettled: () => {
        onClose();
      },
    });
  };

  return (
    <VentanaConfirmar
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Eliminar Usuario"
      description={`¿Está seguro de que desea eliminar el usuario ${usuario?.nombre_usuario || ""}?`}
      variant="eliminar"
      isLoading={isPending}
    />
  );
}

export default VentanaEliminarUsuario;
