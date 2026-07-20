"use client";

import { useState, useEffect } from "react";
import { VentanaFormulario } from "../ui/modals";
import type { UsuarioResponse } from "@models";
import { EntidadPermisos } from "./entidad-permisos";
import { usePutUsuariosRolesMasivo } from "@hooks";
import { useMensajes } from "@services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { Chip } from "../ui/chip";

export interface VentanaPermisosMasivosProps {
  open: boolean;
  onClose: () => void;
  usuarios: UsuarioResponse[];
}

export function VentanaPermisosMasivos({
  open,
  onClose,
  usuarios,
}: VentanaPermisosMasivosProps) {
  const mensajes = useMensajes();
  const { mutate: guardarRolesMasivo, isPending } = usePutUsuariosRolesMasivo();
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (usuarios.length === 0) return;

    const items = usuarios.map((usuario) => {
      if (modo === "reemplazar") {
        return { id: String(usuario.id), roles: selectedRoles };
      }

      const rolesActuales = usuario.roles || [];
      let nuevosRoles = [...rolesActuales];
      if (modo === "agregar") {
        for (const r of selectedRoles) {
          if (!nuevosRoles.includes(r)) nuevosRoles.push(r);
        }
      } else {
        nuevosRoles = nuevosRoles.filter((r) => !selectedRoles.includes(r));
      }

      return { id: String(usuario.id), roles: nuevosRoles };
    });

    guardarRolesMasivo(items, {
      onSuccess: () => {
        mensajes.success("Permisos Actualizados", `Permisos actualizados para ${usuarios.length} usuario(s).`);
        onClose();
      },
      onError: (error: Error) => {
        mensajes.error("Error", error.message || "Ocurrió un error al actualizar permisos masivos.");
      }
    });
  };

  return (
    <VentanaFormulario
      open={open}
      handleClose={onClose}
      onSubmit={onSubmit}
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
              <Select value={modo} onValueChange={(val: "reemplazar" | "agregar" | "quitar") => setModo(val)} disabled={isPending}>
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
