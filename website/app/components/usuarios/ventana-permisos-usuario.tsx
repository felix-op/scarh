"use client";

import { useState, useEffect, useMemo } from "react";
import { VentanaFormulario } from "../ui/modals";
import type { UsuarioResponse } from "@models";
import { opcionesRoles } from "@utils";
import { usePutUsuarioRoles } from "@hooks";
import { useMensajes } from "@services";
import { Chip } from "../ui/chip";
import { EntidadPermisos } from "./entidad-permisos";

export interface VentanaPermisosUsuarioProps {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioResponse | null;
}

export function VentanaPermisosUsuario({
  open,
  onClose,
  usuario,
}: VentanaPermisosUsuarioProps) {
  const mensajes = useMensajes();
  const { mutate: guardarRoles, isPending } = usePutUsuarioRoles();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Solo reiniciamos los roles cuando se abre la ventana
  useEffect(() => {
    if (open) {
      setSelectedRoles(usuario?.roles || []);
    }
  }, [usuario, open]);

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const initialRoles = usuario?.roles || [];
  const hasAdmin = selectedRoles.includes("administracion");

  // Arrays de diferencias
  const addedRoles = selectedRoles.filter((r) => !initialRoles.includes(r));
  const removedRoles = initialRoles.filter((r) => !selectedRoles.includes(r));
  const unchangedRoles = initialRoles.filter((r) => selectedRoles.includes(r));

  // Mapa para mostrar labels de roles
  const roleLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    opcionesRoles.forEach((entidad) => {
      entidad.roles.forEach((rol) => map.set(rol.value, rol.label));
    });
    return map;
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuario) return;

    guardarRoles({ id: String(usuario.id), roles: selectedRoles }, {
      onSuccess: () => {
        mensajes.success("Permisos Actualizados", "Los permisos se han guardado exitosamente.");
        onClose();
      },
      onError: (error: Error) => {
        mensajes.error("Error", error.message || "No se pudieron actualizar los permisos");
      }
    });
  };

  return (
    <VentanaFormulario
      open={open}
      handleClose={onClose}
      onSubmit={onSubmit}
      title={usuario ? `Permisos de ${usuario.nombre_usuario}` : "Permisos"}
      icon="candado"
      isLoading={isPending}
      className="md:max-w-2xl w-full"
    >
      {usuario && (
        <div className="flex flex-col relative">

          {/* Header Sticky - Resumen de Cambios */}
          <div className="sticky top-0 z-10 bg-background-paper pb-4 pt-2 mb-6 border-b border-border flex flex-col gap-3">
            <p className="text-sm text-foreground-secondary mb-1">
              Modifique los permisos. Guarde para aplicar los cambios en el servidor.
            </p>

            {/* Agregados */}
            {addedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-success w-24 shrink-0">Agregados:</span>
                {addedRoles.map((r) => (
                  <Chip key={r} variant="success" size="sm">{roleLabelMap.get(r) || r}</Chip>
                ))}
              </div>
            )}

            {/* Quitados */}
            {removedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-error w-24 shrink-0">Quitados:</span>
                {removedRoles.map((r) => (
                  <Chip key={r} variant="error" size="sm">{roleLabelMap.get(r) || r}</Chip>
                ))}
              </div>
            )}

            {/* Sin cambios */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-foreground-secondary w-24 shrink-0">Sin cambios:</span>
              {unchangedRoles.length === 0 && addedRoles.length === 0 && removedRoles.length === 0 ? (
                <span className="text-sm text-foreground-disabled">Ninguno</span>
              ) : unchangedRoles.length > 0 ? (
                unchangedRoles.map((r) => (
                  <Chip key={r} variant="none" size="sm">{roleLabelMap.get(r) || r}</Chip>
                ))
              ) : (
                <span className="text-sm text-foreground-disabled">Ninguno</span>
              )}
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="button"
                className="text-sm font-medium text-error hover:underline transition-colors"
                onClick={() => setSelectedRoles([])}
                disabled={isPending || selectedRoles.length === 0}
              >
                Quitar todos los permisos
              </button>
            </div>
          </div>

          <EntidadPermisos
            selectedRoles={selectedRoles}
            toggleRole={toggleRole}
            hasAdmin={hasAdmin}
            isDisabled={isPending}
          />

        </div>
      )}
    </VentanaFormulario>
  );
}

export default VentanaPermisosUsuario;
