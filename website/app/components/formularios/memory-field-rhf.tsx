"use client";

import { useMemo, useState } from "react";
import {
  Controller,
  useFormContext,
  RegisterOptions,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";
import { obtenerMemoria, normalizarMemoriaExacta, opcionesMemoria, type MemoryUnit } from "@utils";

export interface MemoryFieldRHFProps {
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rules?: RegisterOptions;
}

/**
 * Campo de memoria (RHF). Se enlaza a UN solo campo del formulario cuyo valor son **bytes**.
 * El input acepta sólo números y la unidad se elige con un `Select` embebido dentro del propio
 * campo (estilizado como botón). Al cambiar valor o unidad, escribe los bytes al formulario.
 */
export function MemoryFieldRHF({
  name,
  label,
  placeholder = "Total de memoria",
  disabled = false,
  required = false,
  rules,
}: MemoryFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];
  const isDisabled = disabled || formState.isSubmitting;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <MemoryFieldInner
          field={field}
          name={name}
          label={label}
          placeholder={placeholder}
          disabled={isDisabled}
          required={required}
          errors={errorMessages}
        />
      )}
    />
  );
}

interface MemoryFieldInnerProps {
  field: ControllerRenderProps<FieldValues, string>;
  name: string;
  label: string;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  errors: string[];
}

function MemoryFieldInner({ field, name, label, placeholder, disabled, required, errors }: MemoryFieldInnerProps) {
  // Inicialización única desde los bytes actuales (múltiplo exacto si aplica).
  const initial = useMemo(() => normalizarMemoriaExacta(Number(field.value) || 0), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [unit, setUnit] = useState<MemoryUnit>(initial.unit);
  const [valueStr, setValueStr] = useState<string>(field.value ? String(initial.value) : "");

  const hasError = errors.length > 0;

  const commit = (nextValue: string, nextUnit: MemoryUnit) => {
    setValueStr(nextValue);
    setUnit(nextUnit);
    if (nextValue === "") {
      field.onChange(null);
      return;
    }
    const num = Number(nextValue);
    field.onChange(isNaN(num) ? null : obtenerMemoria({ unit: nextUnit, value: num }));
  };

  const inputClasses = [
    "w-full border bg-input text-foreground rounded-shape-sm py-2 pl-3 pr-24 text-sm outline-none transition-colors",
    hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus",
    disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      <div className="relative flex items-center w-full">
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={valueStr}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => commit(e.target.value, unit)}
          className={inputClasses}
        />

        {/* Selector de unidad embebido, con apariencia de botón dentro del campo */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <ShadcnSelect value={unit} onValueChange={(v) => commit(valueStr, v as MemoryUnit)} disabled={disabled}>
            <SelectTrigger className="h-8 w-auto gap-1 rounded-shape-sm border-transparent bg-background-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-hover focus:ring-0 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-16 border-border bg-background-paper text-foreground">
              {opcionesMemoria.map((o) => (
                <SelectItem key={o.value} value={o.value} className="focus:bg-input-hover">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadcnSelect>
        </div>
      </div>

      {hasError && <span className="text-xs text-error font-medium">{errors[0]}</span>}
    </div>
  );
}

export default MemoryFieldRHF;
