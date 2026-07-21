"use client";

import { VentanaConfirmar } from "../ui/modals";
import { useDeleteLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import type { LimnigrafoResponse } from "@models";

export interface VentanaEliminarLimnigrafoProps {
  open: boolean;
  onClose: () => void;
  limnigrafo: LimnigrafoResponse | null;
  /** Callback opcional tras eliminar con éxito (ej. redirigir desde el detalle). */
  onDeleted?: () => void;
}

export function VentanaEliminarLimnigrafo({ open, onClose, limnigrafo, onDeleted }: VentanaEliminarLimnigrafoProps) {
  const mensajes = useMensajes();
  const { mutate: eliminarLimnigrafo, isPending } = useDeleteLimnigrafo();

  const onConfirm = () => {
    if (!limnigrafo) return;
    eliminarLimnigrafo(String(limnigrafo.id), {
      onSuccess: () => {
        mensajes.success("Eliminado correctamente", `El limnígrafo ${limnigrafo.codigo} se eliminó correctamente.`);
        onClose();
        onDeleted?.();
      },
      onError: (error: Error) => {
        mensajes.error("Error al eliminar", error.message || "No se pudo eliminar el limnígrafo");
      },
    });
  };

  return (
    <VentanaConfirmar
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="eliminar"
      title="Eliminar limnígrafo"
      description={
        limnigrafo
          ? `¿Seguro que deseas eliminar el limnígrafo ${limnigrafo.codigo}? Esta acción no se puede deshacer.`
          : ""
      }
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      isLoading={isPending}
    />
  );
}

export default VentanaEliminarLimnigrafo;
