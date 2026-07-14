"use client";

import { Ref } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconifyIcon } from "./iconify-icon";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Calendar } from "../shadcn/calendar";

export interface DateFieldProps {
  label: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  ref?: Ref<HTMLButtonElement>; // ref nativo de React 19
}

export function DateField({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  className = "",
  ref,
}: DateFieldProps) {
  const hasError = errors && errors.length > 0;

  const triggerClasses = `
    w-full border bg-input text-foreground rounded-shape-sm px-3 py-2 text-sm outline-none transition-colors text-left flex justify-between items-center
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label arriba */}
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      {/* Popover de calendario */}
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            ref={ref}
            id={name}
            type="button"
            className={triggerClasses}
            disabled={disabled}
          >
            <span className={!value ? "text-foreground-disabled" : ""}>
              {value
                ? format(value, "dd/MM/yyyy", { locale: es })
                : placeholder}
            </span>
            <IconifyIcon variant="calendario" className="text-foreground-disabled text-lg" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-border bg-background-paper shadow-card rounded-shape-sm" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={disabled}
            className="bg-background-paper text-foreground"
          />
        </PopoverContent>
      </Popover>

      {/* Error debajo */}
      {hasError && (
        <span className="text-xs text-error font-medium">{errors[0]}</span>
      )}
    </div>
  );
}

export default DateField;
