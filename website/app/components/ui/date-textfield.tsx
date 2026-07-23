"use client";

import { Ref, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { IconifyIcon } from "./iconify-icon";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Calendar } from "../shadcn/calendar";

export interface DateTextFieldProps {
  label: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>; // ref nativo de React 19
}

const FORMATO_FECHA = "dd/MM/yyyy";

/**
 * Campo de fecha que, a diferencia de `DateField` (sólo calendario), permite
 * escribir la fecha directamente en formato `dd/MM/yyyy` y también elegirla
 * con el botón de calendario. Shadcn no expone una variante "escribible" de
 * `Calendar`/`Popover`, así que se sincronizan a mano un input de texto y el
 * calendario sobre el mismo valor.
 */
export function DateTextField({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  className = "",
  ref,
}: DateTextFieldProps) {
  const [texto, setTexto] = useState(() => (value ? format(value, FORMATO_FECHA, { locale: es }) : ""));
  const [open, setOpen] = useState(false);

  const hasError = errors && errors.length > 0;

  const inputClasses = `
    w-full border bg-input text-foreground rounded-shape-sm py-2 pl-3 pr-10 text-sm outline-none transition-colors
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  const handleTextoChange = (raw: string) => {
    setTexto(raw);

    if (raw.trim() === "") {
      onChange?.(undefined);
      return;
    }

    const parsedDate = parse(raw, FORMATO_FECHA, new Date());
    if (isValid(parsedDate)) {
      onChange?.(parsedDate);
    }
  };

  const handleSeleccionarCalendario = (date?: Date) => {
    setTexto(date ? format(date, FORMATO_FECHA, { locale: es }) : "");
    onChange?.(date);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      <div className="relative flex items-center w-full">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          required={required}
          ref={ref}
          value={texto}
          placeholder={placeholder}
          onChange={(e) => handleTextoChange(e.target.value)}
          className={inputClasses}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label="Elegir fecha en el calendario"
              className="absolute right-2 flex items-center justify-center p-1.5 rounded-full hover:bg-input-hover text-foreground-disabled hover:text-foreground outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconifyIcon variant="calendario" className="text-lg" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border bg-background-paper shadow-card rounded-shape-sm" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleSeleccionarCalendario}
              disabled={disabled}
              className="bg-background-paper text-foreground"
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasError && (
        <span className="text-xs text-error font-medium">{errors[0]}</span>
      )}
    </div>
  );
}

export default DateTextField;
