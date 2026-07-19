"use client";

import { useState, useEffect, useActionState, useRef } from "react";
import { VentanaFormulario } from "@/components/ui/modals";
import type { UsuarioResponse } from "@models";
import { EntidadPermisos } from "./entidad-permisos";
import { guardarPermisosMasivosAction } from "@/services/actions/actions.usuarios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Chip } from "@/components/ui/chip";

export interface VentanaPermisosMasivosProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  usuarios: UsuarioResponse[];
  handleMessage: (msg: { title: string; description: string; variant: "exito" | "error" }) => void;
}

export function VentanaPermisosMasivos({
  open,
  onClose,
  onSuccess,
  usuarios,
  handleMessage,
}: VentanaPermisosMasivosProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [modo, setModo] = useState<"reemplazar" | "agregar" | "quitar">("reemplazar");

  // Limpiar selecciones al abrir
  useEffect(() => {
    if (open) {
      setSelectedRoles([]);
      setModo("reemplazar");
    }
  }, [open]);

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const hasAdmin = selectedRoles.includes("administracion");

  // Integración con Server Action vía useActionState
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => 
      guardarPermisosMasivosAction(
        prevState, 
        formData, 
        usuarios.map(u => String(u.id)), 
        selectedRoles, 
        modo
      ),
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
      title="Gestión Masiva de Permisos"
      icon="candado"
      isLoading={isPending}
      className="md:max-w-2xl w-full"
    >
      {usuarios.length > 0 && (
        <div className="flex flex-col relative">
          
          {/* Header Sticky */}
          <div className="sticky top-0 z-10 bg-background-paper pb-6 pt-2 mb-6 border-b border-border flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground-secondary">
                Se modificarán los permisos de los siguientes usuarios:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {usuarios.map((u) => (
                  <Chip key={u.id} variant="none" size="sm">
                    {u.nombre_usuario}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-64">
              <label className="text-sm font-medium text-foreground">Acción a realizar</label>
              <Select value={modo} onValueChange={(val: any) => setModo(val)} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reemplazar">Reemplazar permisos</SelectItem>
                  <SelectItem value="agregar">Agregar permisos</SelectItem>
                  <SelectItem value="quitar">Eliminar permisos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-foreground-disabled leading-relaxed">
              {modo === "reemplazar" && "Los usuarios seleccionados perderán todos sus roles actuales y sólo tendrán los que elijas a continuación."}
              {modo === "agregar" && "Los roles elegidos se sumarán a los roles que ya posean los usuarios seleccionados."}
              {modo === "quitar" && "Los roles elegidos se eliminarán a los usuarios seleccionados (si es que los poseían)."}
            </p>
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

export default VentanaPermisosMasivos;
