"use client";

import { Ref } from "react";
import { Checkbox as ShadcnCheckbox } from "../shadcn/checkbox";

export interface CheckboxProps {
  label: string;
  name: string;
  description?: string; // Etiqueta al lado del cuadro de verificación
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  ref?: Ref<HTMLButtonElement>; // ref nativo de React 19
}

export function Checkbox({
  label,
  name,
  description,
  errors,
  disabled = false,
  required = false,
  checked,
  onChange,
  className = "",
  ref,
}: CheckboxProps) {
  const hasError = errors && errors.length > 0;
  const checkboxClasses = `
    border rounded-shape-sm transition-colors
    ${hasError ? "border-error focus-visible:ring-error" : "border-input-border focus-visible:ring-input-focus"}
    ${className}
  `.trim();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label principal arriba */}
      <span className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </span>

      {/* Checkbox y su descripción al lado */}
      <div className="flex items-center gap-2.5 py-1">
        <ShadcnCheckbox
          id={name}
          name={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          ref={ref}
          className={checkboxClasses}
        />
        <label
          htmlFor={name}
          className={`text-sm text-foreground select-none ${
            disabled ? "text-foreground-disabled cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {description || label}
        </label>
      </div>

      {/* Error debajo */}
      {hasError && (
        <span className="text-xs text-error font-medium">{errors[0]}</span>
      )}
    </div>
  );
}

export default Checkbox;
