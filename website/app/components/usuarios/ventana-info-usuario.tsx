"use client";

import React from "react";
import { VentanaInfo } from "@/components/ui/modals";
import { Chip } from "@/components/ui/chip";
import type { UsuarioResponse } from "@/models/usuarios";

export interface VentanaInfoUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
}

export function VentanaInfoUsuario({
  open,
  onClose,
  usuario,
}: VentanaInfoUsuarioProps) {
  return (
    <VentanaInfo
      open={open}
      handleClose={onClose}
      title="Detalles del Usuario"
      icon="documento"
      className="md:max-w-md w-full"
    >
      {usuario && (
        <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Nombre Completo</span>
          <span className="text-base text-foreground font-semibold">{`${usuario.first_name} ${usuario.last_name}`}</span>
        </div>

        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Nombre de Usuario</span>
          <span className="text-base text-foreground">{usuario.nombre_usuario}</span>
        </div>

        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Legajo</span>
          <span className="text-base text-foreground">{usuario.legajo || "No asignado"}</span>
        </div>

        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Email</span>
          <span className="text-base text-foreground">{usuario.email}</span>
        </div>

        <div className="flex flex-col gap-1 border-b border-border pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Estado</span>
          <span className="text-base mt-1">
            <Chip variant={usuario.estado ? "success" : "error"} size="sm">
              {usuario.estado ? "Activo" : "Inactivo"}
            </Chip>
          </span>
        </div>

        <div className="flex flex-col gap-1 pb-4">
          <span className="text-sm text-foreground-secondary font-medium">Roles Técnicos Asignados</span>
          <ul className="list-disc list-inside mt-2 text-sm text-foreground flex flex-col gap-1">
            {usuario.roles && usuario.roles.length > 0 ? (
              usuario.roles.map((rol) => (
                <li key={rol}>{rol}</li>
              ))
            ) : (
              <span className="text-foreground-disabled">No tiene roles asignados</span>
            )}
          </ul>
        </div>
        </div>
      )}
    </VentanaInfo>
  );
}

export default VentanaInfoUsuario;
