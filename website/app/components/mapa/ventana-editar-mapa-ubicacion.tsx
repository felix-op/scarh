"use client";

import { useState } from "react";
import { VentanaFormularioRHF } from "../ui/modals";
import { TextFieldRHF } from "../formularios";
import { useEditarUbicacion } from "@hooks";
import { useMensajes } from "@services";
import { ubicacionEditarSchema } from "@utils";
import type { UbicacionResponse } from "@models";

type FormValues = {
  nombre: string;
  longitud: string;
  latitud: string;
};

export interface VentanaEditarMapaUbicacionProps {
  isOpen: boolean;
  onClose: () => void;
  ubicacion: UbicacionResponse | null;
}

/**
 * Edita el nombre y las coordenadas de la ubicación de un limnígrafo. Mover el
 * punto arrastrando desde el mapa sigue estando en «Mover ubicación»; acá se
 * corrigen los números a mano.
 *
 * La ubicación no guarda altura: el modelo `Ubicacion` del backend sólo tiene
 * `nombre`, `latitud` y `longitud`.
 */
export function VentanaEditarMapaUbicacion({ isOpen, onClose, ubicacion }: VentanaEditarMapaUbicacionProps) {
  const mensajes = useMensajes();
  const { mutate, isPending } = useEditarUbicacion();
  const [erroresServidor, setErroresServidor] = useState<Record<string, string | string[]>>({});

  if (!ubicacion) return null;

  const [longitudActual, latitudActual] = ubicacion.geometry.coordinates;

  const onSubmit = (data: FormValues) => {
    setErroresServidor({});
    mutate(
      {
        id: String(ubicacion.id),
        data: {
          nombre: data.nombre.trim(),
          longitud: Number(data.longitud),
          latitud: Number(data.latitud),
        },
      },
      {
        onSuccess: () => {
          mensajes.success("Ubicación actualizada", "Se guardaron los cambios correctamente.");
          onClose();
        },
        onError: (error) => {
          const descripcion = error instanceof Error ? error.message : "No se pudo actualizar la ubicación.";
          setErroresServidor({ general: descripcion });
          mensajes.error("Error al actualizar", descripcion);
        },
      }
    );
  };

  return (
    <VentanaFormularioRHF<FormValues>
      open={isOpen}
      handleClose={onClose}
      title="Editar ubicación"
      icon="ubicacion"
      zodSchema={ubicacionEditarSchema}
      initialValues={{
        nombre: ubicacion.nombre ?? "",
        longitud: String(longitudActual),
        latitud: String(latitudActual),
      }}
      onSubmit={onSubmit}
      errorResponse={erroresServidor}
      isLoading={isPending}
    >
      <div className="flex flex-col gap-4">
        <TextFieldRHF name="nombre" label="Nombre de la ubicación" required />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFieldRHF name="longitud" label="X (longitud)" type="number" step="any" required />
          <TextFieldRHF name="latitud" label="Y (latitud)" type="number" step="any" required />
        </div>

        <p className="text-xs text-foreground-secondary">
          Las coordenadas van en grados decimales. X entre -180 y 180, Y entre -90 y 90.
        </p>
      </div>
    </VentanaFormularioRHF>
  );
}

export default VentanaEditarMapaUbicacion;
