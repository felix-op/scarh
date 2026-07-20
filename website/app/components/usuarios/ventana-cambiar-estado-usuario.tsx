"use client";

import { VentanaConfirmar } from "../ui/modals";
import type { UsuarioResponse } from "@models";
import { usePutUsuario } from "@hooks";
import { useMensajes } from "@services";

export interface VentanaCambiarEstadoUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
}

export function VentanaCambiarEstadoUsuario({
  open,
  onClose,
  usuario,
}: VentanaCambiarEstadoUsuarioProps) {
  const mensajes = useMensajes();
  const { mutate: editarUsuario, isPending } = usePutUsuario();

  const nuevoEstado = !usuario?.estado;
  const accion = nuevoEstado ? "activar" : "desactivar";
  const consecuencia = nuevoEstado
    ? "El usuario podrá ingresar al sistema."
    : "El usuario no podrá ingresar más al sistema.";

  const onConfirm = () => {
    if (!usuario) return;

    editarUsuario({
      id: String(usuario.id),
      data: {
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        nombre_usuario: usuario.nombre_usuario,
        legajo: usuario.legajo,
        email: usuario.email,
        estado: nuevoEstado,
      },
    }, {
      onSuccess: () => {
        mensajes.success("Éxito", `El usuario fue ${nuevoEstado ? "activado" : "desactivado"} correctamente.`);
      },
      onError: (error: Error) => {
        mensajes.error("Error", error.message || `No se pudo ${accion} el usuario.`);
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
      title={nuevoEstado ? "Activar Usuario" : "Desactivar Usuario"}
      variant="warn"
      icon="alerta"
      isLoading={isPending}
    >
      <p>¿Está seguro de que desea {accion} al usuario {usuario?.nombre_usuario || ""}?</p>
      <p className="mt-1 font-medium">{consecuencia}</p>
    </VentanaConfirmar>
  );
}

export default VentanaCambiarEstadoUsuario;
