"use client";

import { useFormContext, FieldValues } from "react-hook-form";
import { BotonGuardar, BotonCancelar } from "../ui/botones";

export interface FormAccionesProps {
  /** Indica si la petición de guardado está en curso. */
  isSaving: boolean;
  /** Callback ejecutado al presionar Cancelar. */
  onCancel: () => void;
}

/**
 * Barra de acciones reutilizable para formularios de edición.
 * Lee `isDirty` del contexto de React Hook Form para deshabilitar
 * el botón Guardar cuando no hay cambios pendientes.
 * Debe renderizarse dentro de un `<Formulario>` (FormProvider).
 */
export function FormAcciones<T extends FieldValues = FieldValues>({
  isSaving,
  onCancel,
}: FormAccionesProps) {
  const { formState: { isDirty } } = useFormContext<T>();

  return (
    <div className="flex justify-between gap-4">
      <BotonCancelar content="Cancelar" onClick={onCancel} disabled={isSaving} />
      <BotonGuardar
        type="submit"
        content="Guardar cambios"
        loading={isSaving}
        disabled={isSaving || !isDirty}
      />
    </div>
  );
}
