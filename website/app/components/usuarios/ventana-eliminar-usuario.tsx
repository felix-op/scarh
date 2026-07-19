"use client";

import { useState } from "react";
import { VentanaConfirmar } from "@/components/ui/modals";
import { deleteServerUsuario } from "@services";
import type { UsuarioResponse } from "@models";

export interface VentanaEliminarUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario?: UsuarioResponse | null;
  handleMessage: (msg: { title: string; description: string; variant: "exito" | "error" }) => void;
}

export function VentanaEliminarUsuario({
  open,
  onClose,
  onSuccess,
  usuario,
  handleMessage,
}: VentanaEliminarUsuarioProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onConfirm = async () => {
    if (!usuario?.id) return;
    setIsLoading(true);
    try {
      await deleteServerUsuario({ params: { id: String(usuario.id) } });
      onSuccess();
      handleMessage({
        title: "Eliminado Correctamente",
        description: `El usuario ${usuario.nombre_usuario} se eliminó correctamente`,
        variant: "exito",
      });
    } catch (error: any) {
      console.error(error);
      handleMessage({
        title: "Error al eliminar",
        description: error?.message || `El usuario ${usuario.nombre_usuario} no se pudo eliminar`,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <VentanaConfirmar
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Eliminar Usuario"
      description={`¿Está seguro de que desea eliminar el usuario ${usuario?.nombre_usuario || ""}?`}
      variant="eliminar"
      isLoading={isLoading}
    />
  );
}

export default VentanaEliminarUsuario;
