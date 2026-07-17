"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/textfield";
import { Boton, BotonCancelar } from "@/components/ui/botones";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/cards";
import { putUsuario } from "@/services/api/usuarios";
import type { UsuarioResponse } from "@/models/usuarios";
import { IconifyIcon } from "@/components/ui/iconify-icon";

export function FormularioEditarUsuario({ usuario }: { usuario: UsuarioResponse }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [estado, setEstado] = useState(usuario.estado);
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; variant: "exito" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setToastMessage(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setIsLoading(true);
    try {
      await putUsuario(String(usuario.id), {
        first_name: data.first_name as string,
        last_name: data.last_name as string,
        nombre_usuario: data.nombre_usuario as string,
        legajo: data.legajo as string,
        email: data.email as string,
        estado: estado,
      });

      router.push("/dashboard/administracion/usuarios");
    } catch (error: any) {
      console.error(error);
      setToastMessage({
        title: "Error al editar",
        description: error?.message || "No se pudo editar el usuario",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl w-full mx-auto p-6 flex flex-col gap-6">
      {toastMessage && (
        <div className={`p-4 rounded-md text-sm font-medium flex items-center justify-between ${
          toastMessage.variant === "error" ? "bg-error-light/20 text-error" : "bg-success-light/20 text-success"
        }`}>
          <div>
            <strong>{toastMessage.title}: </strong>
            {toastMessage.description}
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-4 hover:opacity-70">
            <IconifyIcon variant="cancelar" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            name="first_name"
            label="Nombre"
            placeholder="Nombres"
            defaultValue={usuario.first_name}
            disabled={isLoading}
            required
          />
          <TextField
            name="last_name"
            label="Apellido"
            placeholder="Apellidos"
            defaultValue={usuario.last_name}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <TextField
            name="nombre_usuario"
            label="Nombre de usuario"
            placeholder="Nombre de usuario"
            defaultValue={usuario.nombre_usuario}
            disabled={isLoading}
            required
          />
          <TextField
            name="legajo"
            label="Legajo"
            type="number"
            placeholder="Legajo"
            defaultValue={usuario.legajo}
            disabled={isLoading}
          />
        </div>

        <TextField
          name="email"
          label="Correo Electrónico"
          type="email"
          placeholder="Email"
          defaultValue={usuario.email}
          disabled={isLoading}
          required
        />

        <div className="flex items-center gap-3 mt-2">
          <Checkbox 
            id="estado"
            checked={estado}
            onCheckedChange={(c) => setEstado(c === true)}
            disabled={isLoading}
          />
          <label htmlFor="estado" className="text-sm font-medium text-foreground cursor-pointer">
            Usuario Activo
          </label>
        </div>

        <hr className="border-border my-2" />

        <div className="flex justify-end items-center gap-4">
          <BotonCancelar 
            content="Volver" 
            onClick={() => router.back()} 
            disabled={isLoading} 
          />
          <Boton 
            variant="primary" 
            type="submit" 
            content="Guardar Cambios" 
            icon="guardar"
            loading={isLoading} 
            disabled={isLoading} 
          />
        </div>
      </form>
    </Card>
  );
}
