"use client";

import { Ref } from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../shadcn/select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  options: SelectOption[];
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  /** Posición del label. `"top"` (default): encima del selector. `"right"`: a la derecha, en línea. */
  labelPosition?: "top" | "right";
  ref?: Ref<HTMLButtonElement>;
}

export function Select({
  label,
  name,
  options,
  errors,
  disabled = false,
  required = false,
  placeholder = "Seleccionar...",
  value,
  onChange,
  className = "",
  labelPosition = "top",
  ref,
}: SelectProps) {
  const hasError = errors && errors.length > 0;
  const triggerClasses = `
    w-full border bg-input text-foreground rounded-shape-sm px-3 py-2 text-sm outline-none transition-colors text-left flex justify-between items-center
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  const labelEl = (
    <label
      htmlFor={name}
      className={`text-sm font-medium text-foreground${labelPosition === "right" ? " whitespace-nowrap" : ""}`}
    >
      {label} {required && <span className="text-error">*</span>}
    </label>
  );

  const trigger = (
    <ShadcnSelect value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger ref={ref} id={name} className={triggerClasses}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-border bg-background-paper text-foreground shadow-card rounded-shape-sm">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="focus:bg-input-hover focus:text-foreground">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );

  if (labelPosition === "right") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {trigger}
          {labelEl}
        </div>
        {hasError && (
          <span className="text-xs text-error font-medium">{errors![0]}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {labelEl}
      {trigger}
      {hasError && (
        <span className="text-xs text-error font-medium">{errors![0]}</span>
      )}
    </div>
  );
}

export default Select;
