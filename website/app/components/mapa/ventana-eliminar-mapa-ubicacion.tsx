"use client";

import { VentanaConfirmar } from "../ui/modals";
import { usePatchLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import type { LimnigrafoResponse } from "@models";

export interface VentanaEliminarMapaUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
  limnigrafo: LimnigrafoResponse | null;
}

/**
 * Sólo desasigna la ubicación del limnígrafo (`ubicacion_id = null`); no borra
 * el registro de `Ubicacion` porque el modelo la protege mientras el
 * limnígrafo la referencie (`on_delete=PROTECT`) y `RutaAcceso` también puede
 * apuntar a la misma ubicación.
 */
export function VentanaEliminarMapaUbicacion({ isOpen, onClose, limnigrafo }: VentanaEliminarMapaUbicacionProps) {
  const mensajes = useMensajes();
  const { mutate, isPending } = usePatchLimnigrafo();

  const handleConfirm = () => {
    if (!limnigrafo) return;
    mutate(
      { id: String(limnigrafo.id), data: { ubicacion_id: null } },
      {
        onSuccess: () => {
          mensajes.success("Ubicación quitada", `Se quitó la ubicación de ${limnigrafo.codigo}.`);
          onClose();
        },
        onError: (error) => {
          mensajes.error(
            "Error al quitar la ubicación",
            error instanceof Error ? error.message : "Ocurrió un error inesperado."
          );
        },
      }
    );
  };

  return (
    <VentanaConfirmar
      open={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      variant="eliminar"
      title="Quitar ubicación"
      description={
        limnigrafo
          ? `¿Seguro que querés quitarle la ubicación a ${limnigrafo.codigo}? Vas a poder asignarle una nueva más adelante.`
          : ""
      }
      confirmText="Sí, quitar"
      cancelText="Cancelar"
      isLoading={isPending}
    />
  );
}

export default VentanaEliminarMapaUbicacion;
