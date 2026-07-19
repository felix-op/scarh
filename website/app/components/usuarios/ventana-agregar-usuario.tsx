"use client";

import React, { useState } from "react";
import { VentanaFormulario } from "@/components/ui/modals";
import { TextField } from "@/components/ui/textfield";
import { postServerUsuario } from "@services";

export interface VentanaAgregarUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  handleMessage: (msg: { title: string; description: string; variant: "exito" | "error" }) => void;
}

export function VentanaAgregarUsuario({
  open,
  onClose,
  onSuccess,
  handleMessage,
}: VentanaAgregarUsuarioProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Validación básica de contraseñas
    if (data.password !== data.passwordConfirm) {
      setErrors({ passwordConfirm: ["Las contraseñas no coinciden"] });
      return;
    }

    setIsLoading(true);
    try {
      await postServerUsuario({
        first_name: data.first_name as string,
        last_name: data.last_name as string,
        nombre_usuario: data.nombre_usuario as string,
        legajo: data.legajo as string,
        email: data.email as string,
        contraseña: data.password as string,
        estado: true,
      });
      
      onSuccess();
      handleMessage({
        title: "Creado Correctamente",
        description: `El usuario ${data.nombre_usuario} se creó correctamente`,
        variant: "exito",
      });
      onClose();
    } catch (error: any) {
      console.error(error);
      handleMessage({
        title: "Error al crear",
        description: error?.message || "No se pudo crear el usuario",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VentanaFormulario
      open={open}
      handleClose={onClose}
      onSubmit={handleSubmit}
      title="Agregar Usuario"
      icon="agregar"
      isLoading={isLoading}
      className="md:max-w-md w-full"
    >
      <div className="flex flex-col gap-4 py-2">
        <TextField
          name="first_name"
          label="Nombre"
          placeholder="Ingrese el o los nombres del usuario"
          disabled={isLoading}
          required
        />
        <TextField
          name="last_name"
          label="Apellido"
          placeholder="Ingrese el o los apellidos del usuario"
          disabled={isLoading}
          required
        />
        <TextField
          name="nombre_usuario"
          label="Nombre de usuario"
          placeholder="Ingrese el nombre de usuario"
          disabled={isLoading}
          required
        />
        <TextField
          name="legajo"
          label="Legajo"
          type="number"
          placeholder="Ingrese el legajo"
          disabled={isLoading}
        />
        <TextField
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="Ingrese el correo electrónico"
          disabled={isLoading}
          required
        />
        <TextField
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Ingrese una contraseña segura"
          disabled={isLoading}
          required
        />
        <TextField
          name="passwordConfirm"
          label="Confirmar Contraseña"
          type="password"
          placeholder="Confirme la contraseña"
          errors={errors.passwordConfirm}
          disabled={isLoading}
          required
        />
      </div>
    </VentanaFormulario>
  );
}

export default VentanaAgregarUsuario;
