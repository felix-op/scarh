"use client";

import { useActionState, useEffect, useRef } from "react";
import { VentanaFormulario } from "@/components/ui/modals";
import { TextField } from "@/components/ui/textfield";
import type { UsuarioResponse } from "@/models/usuarios";
import { editarUsuarioAction } from "@/services/usuarios.actions";

export interface VentanaEditarUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario?: UsuarioResponse | null;
  handleMessage: (msg: { title: string; description: string; variant: "exito" | "error" }) => void;
}

export function VentanaEditarUsuario({
  open,
  onClose,
  onSuccess,
  usuario,
  handleMessage,
}: VentanaEditarUsuarioProps) {
  // Integración con Server Action vía useActionState
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => 
      editarUsuarioAction(prevState, formData, usuario ? String(usuario.id) : ""),
    { status: "none", timestamp: 0 }
  );

  const handledTimestamp = useRef<number | undefined>(0);

  useEffect(() => {
    if (state.timestamp && state.timestamp !== handledTimestamp.current) {
      handledTimestamp.current = state.timestamp;
      
      if (state.status === "ok") {
        onSuccess();
        handleMessage({
          title: "Usuario Editado",
          description: state.message || "Los datos del usuario se actualizaron correctamente.",
          variant: "exito",
        });
        onClose();
      } else if (state.status === "error") {
        handleMessage({
          title: "Error",
          description: state.message || "No se pudo editar el usuario.",
          variant: "error",
        });
      }
    }
  }, [state, handleMessage, onSuccess, onClose]);

  return (
    <VentanaFormulario
      open={open}
      handleClose={onClose}
      action={formAction}
      title="Editar Usuario"
      icon="editar"
      isLoading={isPending}
      className="md:max-w-xl w-full"
    >
      {usuario && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <TextField
              name="first_name"
              label="Nombre"
              placeholder="Nombres"
              defaultValue={usuario.first_name}
              disabled={isPending}
              required
            />
            <TextField
              name="last_name"
              label="Apellido"
              placeholder="Apellidos"
              defaultValue={usuario.last_name}
              disabled={isPending}
              required
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <TextField
              name="nombre_usuario"
              label="Nombre de usuario"
              placeholder="Nombre de usuario"
              defaultValue={usuario.nombre_usuario}
              disabled={isPending}
              required
            />
            <TextField
              name="legajo"
              label="Legajo"
              type="number"
              placeholder="Legajo"
              defaultValue={usuario.legajo}
              disabled={isPending}
            />
          </div>

          <TextField
            name="email"
            label="Correo Electrónico"
            type="email"
            placeholder="Email"
            defaultValue={usuario.email}
            disabled={isPending}
            required
          />
        </div>
      )}
    </VentanaFormulario>
  );
}

export default VentanaEditarUsuario;
