"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { VentanaFormularioRHF } from "../ui/modals";
import { TextFieldRHF } from "../formularios";
import { useMensajes } from "@services";
import { patchSSRPerfil } from "@services";
import { perfilSchema } from "@utils";
import { ApiError, type PerfilResponse } from "@models";

type FormValues = {
  nombre_usuario: string;
  legajo: string;
  email: string;
  first_name: string;
  last_name: string;
};

/**
 * Formulario de edición del perfil propio.
 *
 * Sólo información personal: contraseña, estado y roles no están, y el backend los
 * rechaza aunque alguien los mande.
 *
 * @property {boolean} open Si la ventana está abierta.
 * @property {PerfilResponse} perfil Valores actuales.
 * @property {() => void} onClose Cierra la ventana.
 */
export interface VentanaEditarPerfilProps {
  open: boolean;
  perfil: PerfilResponse;
  onClose: () => void;
}

export function VentanaEditarPerfil({ open, perfil, onClose }: VentanaEditarPerfilProps) {
  const router = useRouter();
  const mensajes = useMensajes();
  const [guardando, setGuardando] = useState(false);
  const [, startTransition] = useTransition();
  const [erroresServidor, setErroresServidor] = useState<Record<string, string | string[]>>({});

  const onSubmit = async (data: FormValues) => {
    setGuardando(true);
    setErroresServidor({});

    try {
      await patchSSRPerfil({
        nombre_usuario: data.nombre_usuario.trim(),
        legajo: data.legajo.trim() || null,
        email: data.email.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
      });

      mensajes.success("Perfil actualizado", "Tus datos se guardaron correctamente.");
      onClose();
      // Refresca el Server Component para que la ficha muestre lo guardado sin
      // duplicar el estado del perfil del lado del cliente.
      startTransition(() => router.refresh());
    } catch (error) {
      if (error instanceof ApiError) {
        setErroresServidor({ general: error.descripcionUsuario });
        mensajes.error("No se pudo guardar", error.descripcionUsuario);
      } else {
        mensajes.error("No se pudo guardar", "Ocurrió un error inesperado.");
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <VentanaFormularioRHF<FormValues>
      open={open}
      handleClose={onClose}
      title="Editar perfil"
      icon="editar"
      zodSchema={perfilSchema}
      initialValues={{
        nombre_usuario: perfil.nombre_usuario,
        legajo: perfil.legajo ?? "",
        email: perfil.email,
        first_name: perfil.first_name,
        last_name: perfil.last_name,
      }}
      onSubmit={onSubmit}
      errorResponse={erroresServidor}
      isLoading={guardando}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextFieldRHF name="first_name" label="Nombre" required />
        <TextFieldRHF name="last_name" label="Apellido" required />
        <TextFieldRHF name="nombre_usuario" label="Nombre de usuario" required />
        <TextFieldRHF name="legajo" label="Legajo" />
        <div className="sm:col-span-2">
          <TextFieldRHF name="email" label="Correo electrónico" type="email" required />
        </div>
      </div>
    </VentanaFormularioRHF>
  );
}
