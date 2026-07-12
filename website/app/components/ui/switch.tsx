"use client";

import React, { forwardRef } from "react";
import { Switch as ShadcnSwitch } from "../shadcn/switch";

export interface SwitchProps {
  label: string;
  name: string;
  description?: string; // Etiqueta al lado del switch
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      label,
      name,
      description,
      errors,
      disabled = false,
      required = false,
      checked,
      onChange,
      className = "",
    },
    ref
  ) => {
    const hasError = errors && errors.length > 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label principal arriba */}
        <span className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-error">*</span>}
        </span>

        {/* Switch y descripción al lado */}
        <div className="flex items-center gap-3 py-1">
          <ShadcnSwitch
            id={name}
            name={name}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            ref={ref}
            className={className}
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

        {/* Error abajo */}
        {hasError && (
          <span className="text-xs text-error font-medium">{errors[0]}</span>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
export default Switch;
