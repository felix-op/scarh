"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import { format, isValid, parse } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import { Calendar } from "../shadcn/calendar";

const FORMATO_FECHA_HORA = "dd/MM/yyyy HH:mm";
const MAX_DIGITOS = 12;
const TECLAS_NAVEGACION = ["Tab", "Shift", "ArrowLeft", "ArrowRight", "Home", "End"];

function formatearDigitos(digitos: string): string {
  const mascara = "dd/MM/yyyy HH:mm";
  let resultado = "";
  let indice = 0;

  for (const caracter of mascara) {
    if ("dMyHm".includes(caracter)) {
      if (indice >= digitos.length) break;
      resultado += digitos[indice++];
    } else {
      resultado += caracter;
    }
  }

  return resultado;
}

function digitosDeTexto(texto: string): string {
  return texto.replace(/\D/g, "").slice(0, MAX_DIGITOS);
}

function posicionDesdeIndice(indice: number): number {
  return formatearDigitos("0".repeat(indice)).length;
}

function indiceDesdePosicion(texto: string, posicion: number): number {
  return digitosDeTexto(texto.slice(0, posicion)).length;
}

/**
 * Campo editable de fecha y hora, con calendario opcional al final.
 * @property {string} label Etiqueta visible del campo.
 * @property {string} name Identificador del input.
 * @property {Date} [value] Fecha y hora seleccionadas.
 * @property {(fecha?: Date) => void} [onChange] Recibe una fecha sólo cuando el texto es válido.
 * @property {ReactNode} [endIcon] Contenido que abre el calendario; si se omite, no se muestra calendario.
 * @property {string[]} [errors] Mensajes de validación.
 * @property {boolean} [disabled] Deshabilita el campo.
 * @property {boolean} [required] Marca el campo como requerido.
 * @property {string} [placeholder] Ayuda para el formato esperado.
 * @property {string} [className] Clases adicionales para el input.
 */
export interface DateTimeFieldProps {
  label: string;
  name: string;
  value?: Date;
  onChange?: (_fecha?: Date) => void;
  endIcon?: ReactNode;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

function fechaDesdeDigitos(digitos: string): Date | undefined {
  if (digitos.length !== MAX_DIGITOS) return undefined;
  const texto = formatearDigitos(digitos);
  const fecha = parse(texto, FORMATO_FECHA_HORA, new Date());
  return isValid(fecha) && format(fecha, FORMATO_FECHA_HORA) === texto ? fecha : undefined;
}

export function DateTimeField({
  label,
  name,
  value,
  onChange,
  endIcon,
  errors,
  disabled = false,
  required = false,
  placeholder = "dd/mm/aaaa hh:mm",
  className = "",
  ref,
}: DateTimeFieldProps) {
  const [digitos, setDigitos] = useState(() => (value ? format(value, "ddMMyyyyHHmm") : ""));
  const [abierto, setAbierto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = (errors?.length ?? 0) > 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza reset y cambios externos del valor controlado.
    setDigitos(value ? format(value, "ddMMyyyyHHmm") : "");
  }, [value]);

  const commit = (siguientesDigitos: string, siguienteIndice: number) => {
    const valor = digitosDeTexto(siguientesDigitos);
    setDigitos(valor);

    if (valor === "") {
      onChange?.(undefined);
    } else {
      const fecha = fechaDesdeDigitos(valor);
      if (fecha) onChange?.(fecha);
    }

    requestAnimationFrame(() => {
      const indice = Math.min(siguienteIndice, valor.length);
      const inicio = posicionDesdeIndice(indice);
      inputRef.current?.setSelectionRange(inicio, inicio);
    });
  };

  const reemplazarDigito = (indice: number, digito: string): string =>
    indice < digitos.length
      ? `${digitos.slice(0, indice)}${digito}${digitos.slice(indice + 1)}`
      : `${digitos}${digito}`;

  const esDigitoValido = (indice: number, digito: string): boolean => {
    if (indice === 0) return Number(digito) <= 3;
    if (indice === 1) {
      const dia = Number(`${digitos[0] ?? ""}${digito}`);
      return dia >= 1 && dia <= 31;
    }
    if (indice === 2) return Number(digito) <= 9;
    if (indice === 3) {
      const mes = Number(`${digitos[2] ?? ""}${digito}`);
      return mes >= 1 && mes <= 12;
    }
    if (indice === 8) return Number(digito) <= 2;
    if (indice === 9) {
      const hora = Number(`${digitos[8] ?? ""}${digito}`);
      return hora <= 23;
    }
    if (indice === 10) return Number(digito) <= 5;
    return true;
  };

  const handleTextoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const siguiente = event.target.value;
    const indice = indiceDesdePosicion(siguiente, event.target.selectionStart ?? siguiente.length);
    commit(siguiente, indice);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inicioSeleccion = event.currentTarget.selectionStart ?? 0;
    const inicio = indiceDesdePosicion(event.currentTarget.value, inicioSeleccion);

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      if (inicio >= MAX_DIGITOS || !esDigitoValido(inicio, event.key)) return;

      // Del 2 al 9 en el primer dígito del mes se interpreta directamente como
      // febrero–septiembre: se completa el cero y se salta al año.
      if (inicio === 2 && Number(event.key) >= 2) {
        const conMes = reemplazarDigito(2, "0");
        const siguiente = conMes.length > 3
          ? `${conMes.slice(0, 3)}${event.key}${conMes.slice(4)}`
          : `${conMes}${event.key}`;
        commit(siguiente, 4);
        return;
      }

      commit(reemplazarDigito(inicio, event.key), inicio + 1);
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (inicio > 0) {
        const posicionAnterior = posicionDesdeIndice(inicio - 1);
        event.currentTarget.setSelectionRange(posicionAnterior, posicionAnterior);
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      return;
    }

    if (event.key === "/" || event.key === ":") {
      event.preventDefault();
      const siguienteSeparador = event.currentTarget.value.indexOf(event.key, inicioSeleccion);
      if (siguienteSeparador >= 0) {
        event.currentTarget.setSelectionRange(siguienteSeparador + 1, siguienteSeparador + 1);
      }
      return;
    }

    if (!event.ctrlKey && !event.metaKey && !TECLAS_NAVEGACION.includes(event.key)) event.preventDefault();
  };

  const handleSeleccionarFecha = (fecha?: Date) => {
    if (!fecha) return;

    const horaActual = fechaDesdeDigitos(digitos);
    const siguiente = new Date(fecha);
    siguiente.setHours(horaActual?.getHours() ?? 0, horaActual?.getMinutes() ?? 0, 0, 0);
    setDigitos(format(siguiente, "ddMMyyyyHHmm"));
    onChange?.(siguiente);
    setAbierto(false);
  };

  const inputClasses = `
    w-full border bg-input text-foreground rounded-shape-sm py-2 pl-3 text-sm outline-none transition-colors
    ${endIcon ? "pr-10" : "pr-3"}
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  const asignarRef = (elemento: HTMLInputElement | null) => {
    inputRef.current = elemento;
    if (typeof ref === "function") ref(elemento);
    else if (ref) (ref as MutableRefObject<HTMLInputElement | null>).current = elemento;
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      <div className="relative flex w-full items-center">
        <input
          ref={asignarRef}
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatearDigitos(digitos)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={handleTextoChange}
          onKeyDown={handleKeyDown}
          className={inputClasses}
        />

        {endIcon && (
          <Popover open={abierto} onOpenChange={setAbierto}>
            <PopoverTrigger asChild disabled={disabled}>
              <button
                type="button"
                tabIndex={-1}
                disabled={disabled}
                aria-label="Elegir fecha en el calendario"
                className="absolute right-2 flex cursor-pointer items-center justify-center p-1.5 text-foreground-disabled outline-none transition-colors hover:bg-input-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {endIcon}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto rounded-shape-sm border-border bg-background-paper p-0 shadow-card" align="end">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleSeleccionarFecha}
                disabled={disabled}
                className="bg-background-paper text-foreground"
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {hasError && <span className="text-xs font-medium text-error">{errors?.[0]}</span>}
    </div>
  );
}
