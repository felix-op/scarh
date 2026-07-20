"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VentanaFormulario } from "@/components/ui/modals";
import { TextFieldRHF } from "@/components/formularios";
import type { UsuarioResponse } from "@models";
import { usePutUsuario } from "@hooks";
import { useMensajes } from "@services";
import { usuarioPutSchema } from "@utils";

type FormValues = z.infer<typeof usuarioPutSchema>;

export interface VentanaEditarUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
}

export function VentanaEditarUsuario({
  open,
  onClose,
  usuario,
}: VentanaEditarUsuarioProps) {
  const mensajes = useMensajes();
  const { mutate: editarUsuario, isPending } = usePutUsuario();

  const methods = useForm<FormValues>({
    resolver: zodResolver(usuarioPutSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      nombre_usuario: "",
      legajo: "",
      email: "",
      estado: true,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open && usuario) {
      methods.reset({
        first_name: usuario.first_name || "",
        last_name: usuario.last_name || "",
        nombre_usuario: usuario.nombre_usuario || "",
        legajo: usuario.legajo ? String(usuario.legajo) : "",
        email: usuario.email || "",
        estado: usuario.estado,
      });
    }
  }, [open, usuario, methods]);

  const onSubmit = (data: FormValues) => {
    if (!usuario) return;

    editarUsuario({
      id: String(usuario.id),
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        nombre_usuario: data.nombre_usuario,
        legajo: data.legajo,
        email: data.email,
        estado: data.estado,
      }
    }, {
      onSuccess: () => {
        mensajes.success("Usuario Editado", "Los datos del usuario se actualizaron correctamente.");
        onClose();
      },
      onError: (error: any) => {
        mensajes.error("Error", error?.message || "No se pudo editar el usuario.");
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <VentanaFormulario
        open={open}
        handleClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
        title="Editar Usuario"
        icon="editar"
        isLoading={isPending}
        className="md:max-w-xl w-full"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4">
            <TextFieldRHF
              name="first_name"
              label="Nombre"
              placeholder="Nombres"
              required
            />
            <TextFieldRHF
              name="last_name"
              label="Apellido"
              placeholder="Apellidos"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <TextFieldRHF
              name="nombre_usuario"
              label="Nombre de usuario"
              placeholder="Nombre de usuario"
              required
            />
            <TextFieldRHF
              name="legajo"
              label="Legajo"
              type="number"
              placeholder="Legajo"
              required
            />
          </div>

          <TextFieldRHF
            name="email"
            label="Correo Electrónico"
            type="email"
            placeholder="Email"
            required
          />
        </div>
      </VentanaFormulario>
    </FormProvider>
  );
}

export default VentanaEditarUsuario;
