"use client";

import { useState, useEffect, useMemo, useActionState, useRef } from "react";
import { VentanaFormulario } from "@/components/ui/modals";
import type { UsuarioResponse } from "@models";
import { opcionesRoles } from "@utils";
import { Chip } from "@/components/ui/chip";
import { EntidadPermisos } from "./entidad-permisos";
import { guardarPermisosIndividualAction } from "@/services/actions/actions.usuarios";

export interface VentanaPermisosUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuario?: UsuarioResponse | null;
  handleMessage: (msg: { title: string; description: string; variant: "exito" | "error" }) => void;
}

export function VentanaPermisosUsuario({
  open,
  onClose,
  onSuccess,
  usuario,
  handleMessage,
}: VentanaPermisosUsuarioProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Solo reiniciamos los roles cuando se abre la ventana
  useEffect(() => {
    if (open) {
      setSelectedRoles(usuario?.roles || []);
    }
  }, [open]);

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

  // Integración con Server Action vía useActionState
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => 
      guardarPermisosIndividualAction(prevState, formData, usuario ? String(usuario.id) : "", selectedRoles),
    { status: "none", timestamp: 0 }
  );

  const handledTimestamp = useRef<number | undefined>(0);

  useEffect(() => {
    if (state.timestamp && state.timestamp !== handledTimestamp.current) {
      handledTimestamp.current = state.timestamp;
      
      if (state.status === "ok") {
        onSuccess();
        handleMessage({
          title: "Permisos Actualizados",
          description: state.message || "Los permisos se han guardado exitosamente.",
          variant: "exito",
        });
        onClose();
      } else if (state.status === "error") {
        handleMessage({
          title: "Error",
          description: state.message || "No se pudieron actualizar los permisos",
          variant: "error",
        });
      }
    }
  }, [state, handleMessage, onSuccess, onClose]);

  return (
    <VentanaFormulario
      open={open}
      handleClose={onClose}
      action={formAction}
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
