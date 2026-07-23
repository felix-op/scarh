"use client";

import { useState } from "react";
import { Ventana } from "../ui/modals";
import { TextField } from "../ui/textfield";
import { Boton, BotonCancelar } from "../ui/botones";
import { useEditarUbicacion } from "@hooks";
import { useMensajes } from "@services";
import type { UbicacionResponse } from "@models";

export interface VentanaEditarMapaUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
  ubicacion: UbicacionResponse | null;
}

/** Renombra la ubicación de un limnígrafo. Mover la posición se hace desde el mapa, no acá. */
export function VentanaEditarMapaUbicacion({ isOpen, onClose, ubicacion }: VentanaEditarMapaUbicacionProps) {
  const mensajes = useMensajes();
  const { mutate, isPending } = useEditarUbicacion();
  const [nombre, setNombre] = useState(ubicacion?.nombre ?? "");

  if (!ubicacion) return null;

  const handleGuardar = () => {
    mutate(
      { id: String(ubicacion.id), data: { nombre } },
      {
        onSuccess: () => {
          mensajes.success("Ubicación actualizada", "Se guardaron los cambios correctamente.");
          onClose();
        },
        onError: (error) => {
          mensajes.error(
            "Error al actualizar",
            error instanceof Error ? error.message : "No se pudo actualizar la ubicación."
          );
        },
      }
    );
  };

  return (
    <Ventana open={isOpen} handleClose={onClose} title="Editar ubicación">
      <div className="flex flex-col gap-4">
        <TextField
          label="Nombre de la ubicación"
          name="nombre-ubicacion"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <BotonCancelar onClick={onClose} disabled={isPending} />
          <Boton content="Guardar" loading={isPending} onClick={handleGuardar} />
        </div>
      </div>
    </Ventana>
  );
}

export default VentanaEditarMapaUbicacion;
