"use client";

import { ClipboardEvent, KeyboardEvent, Ref, useEffect, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { IconifyIcon } from "../ui/iconify-icon";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Calendar } from "../shadcn/calendar";

export interface DateTimeMaskFieldProps {
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

const MASCARA = "dd/MM/yyyy HH:mm";
const MAX_DIGITOS = 12; // dd(2) + MM(2) + yyyy(4) + HH(2) + mm(2)
const TECLAS_NAVEGACION = ["Tab", "Shift", "ArrowLeft", "ArrowRight", "Home", "End"];

/** Arma el texto con separadores fijos ("dd/MM/yyyy HH:mm") a partir de los dígitos ya cargados. */
function formatearDigitos(digitos: string): string {
  let resultado = "";
  let cursor = 0;
  for (const caracter of MASCARA) {
    if (caracter === "d" || caracter === "M" || caracter === "y" || caracter === "H" || caracter === "m") {
      if (cursor >= digitos.length) break;
      resultado += digitos[cursor];
      cursor += 1;
    } else {
      resultado += caracter;
    }
  }
  return resultado;
}

function digitosDesdeFecha(value?: Date): string {
  if (!value || !isValid(value)) return "";
  return format(value, "ddMMyyyyHHmm");
}

/** Parsea los 12 dígitos según la máscara; rechaza fechas que "roll-over" (ej. 31/04) igual que un input nativo. */
function fechaDesdeDigitos(digitos: string): Date | undefined {
  if (digitos.length < MAX_DIGITOS) return undefined;
  const texto = formatearDigitos(digitos);
  const parsed = parse(texto, MASCARA, new Date());
  return isValid(parsed) && format(parsed, MASCARA) === texto ? parsed : undefined;
}

/**
 * Campo de fecha y hora con botón de calendario, que además permite escribirla
 * directamente (como el `<input type="datetime-local">` nativo): al tipear
 * dígitos se van completando día/mes/año/hora/minuto con los separadores
 * puestos automáticamente.
 */
export function DateTimeMaskField({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  value,
  onChange,
  placeholder = "dd/mm/aaaa hh:mm",
  className = "",
  ref,
}: DateTimeMaskFieldProps) {
  const [digitos, setDigitos] = useState<string>(() => digitosDesdeFecha(value));

  // Resincroniza si el valor cambia desde afuera (reset de formulario, selección externa, etc.),
  // pero no mientras el usuario está completando los 12 dígitos (ahí `value` todavía es `undefined`).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value) setDigitos(digitosDesdeFecha(value));
    else if (digitos.length === MAX_DIGITOS) setDigitos("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (nuevosDigitos: string) => {
    setDigitos(nuevosDigitos);
    onChange?.(fechaDesdeDigitos(nuevosDigitos));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      if (digitos.length < MAX_DIGITOS) commit(digitos + event.key);
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      commit(digitos.slice(0, -1));
      return;
    }

    if (!TECLAS_NAVEGACION.includes(event.key)) {
      event.preventDefault();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (disabled) return;
    const soloDigitos = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, MAX_DIGITOS);
    commit(soloDigitos);
  };

  const handleCalendarSelect = (fecha?: Date) => {
    if (!fecha) {
      commit("");
      return;
    }
    // Conserva la hora ya escrita (o 00:00 si todavía no se cargó ninguna).
    const horaActual = digitos.length >= 10 ? digitos.slice(8, 12) : "0000";
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setHours(Number(horaActual.slice(0, 2)), Number(horaActual.slice(2, 4)), 0, 0);
    commit(format(nuevaFecha, "ddMMyyyyHHmm"));
  };

  const hasError = errors && errors.length > 0;

  const inputClasses = `
    w-full border bg-input text-foreground rounded-shape-sm pl-3 pr-9 py-2 text-sm outline-none transition-colors
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      <div className="relative flex items-center">
        <input
          ref={ref}
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatearDigitos(digitos)}
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
        />

        <Popover>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2.5 text-foreground-disabled hover:text-foreground disabled:cursor-not-allowed disabled:hover:text-foreground-disabled"
              disabled={disabled}
              aria-label="Elegir fecha"
            >
              <IconifyIcon variant="calendario" className="text-lg" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border bg-background-paper shadow-card rounded-shape-sm" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={disabled}
              className="bg-background-paper text-foreground"
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasError && <span className="text-xs text-error font-medium">{errors[0]}</span>}
    </div>
  );
}

export default DateTimeMaskField;
