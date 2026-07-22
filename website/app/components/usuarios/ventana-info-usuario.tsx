"use client";

import { VentanaInfo } from "@/components/ui/modals";
import { Chip } from "@/components/ui/chip";
import type { UsuarioResponse } from "@models";

export interface VentanaInfoUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
  loading?: boolean;
}

const camposUsuario = [
  "Nombre Completo",
  "Nombre de Usuario",
  "Legajo",
  "Email",
  "Estado",
  "Roles Técnicos Asignados",
];

function PlaceholderCampo({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0">
      <span className="text-sm text-foreground-secondary font-medium">{label}</span>
      <div className="h-4 w-40 rounded-shape-sm bg-default-dark animate-pulse" />
    </div>
  );
}

export function VentanaInfoUsuario({
  open,
  onClose,
  usuario,
  loading = false,
}: VentanaInfoUsuarioProps) {
  return (
    <VentanaInfo
      open={open}
      handleClose={onClose}
      title="Detalles del Usuario"
      icon="documento"
      className="md:max-w-md w-full"
    >
      {loading && (
        <div className="flex flex-col gap-6">
          {camposUsuario.map((label) => (
            <PlaceholderCampo key={label} label={label} />
          ))}
        </div>
      )}

      {!loading && usuario && (
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
