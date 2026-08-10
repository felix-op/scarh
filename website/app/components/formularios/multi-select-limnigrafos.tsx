"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../shadcn/command";
import { IconifyIcon } from "../ui/iconify-icon";

/**
 * Opción del selector.
 * @property {number} id Identificador del limnígrafo.
 * @property {string} codigo Código visible.
 * @property {string} [descripcion] Texto secundario, también buscable.
 */
export interface OpcionLimnigrafo {
  id: number;
  codigo: string;
  descripcion?: string;
}

/**
 * Selector de limnígrafos con búsqueda.
 *
 * Funciona en modo múltiple o único según `seleccionUnica`, para que la misma
 * pieza sirva en las vistas que comparan dispositivos y en la que resume uno solo.
 *
 * @property {OpcionLimnigrafo[]} opciones Limnígrafos disponibles.
 * @property {number[]} value IDs seleccionados.
 * @property {(ids: number[]) => void} onChange Notifica la nueva selección.
 * @property {string} [label] Etiqueta del campo.
 * @property {boolean} [seleccionUnica] Limita la selección a un elemento.
 * @property {string} [error] Mensaje de error a mostrar debajo.
 * @property {boolean} [disabled] Deshabilita el control.
 */
export interface MultiSelectLimnigrafosProps {
  opciones: OpcionLimnigrafo[];
  value: number[];
  onChange: (_ids: number[]) => void;
  label?: string;
  seleccionUnica?: boolean;
  error?: string;
  disabled?: boolean;
}

export function MultiSelectLimnigrafos({
  opciones,
  value,
  onChange,
  label = "Dispositivos",
  seleccionUnica = false,
  error,
  disabled = false,
}: MultiSelectLimnigrafosProps) {
  const [abierto, setAbierto] = useState(false);

  const seleccionados = new Set(value);
  const todosSeleccionados = opciones.length > 0 && value.length === opciones.length;

  const alternar = (id: number) => {
    if (seleccionUnica) {
      onChange([id]);
      setAbierto(false);
      return;
    }

    onChange(seleccionados.has(id) ? value.filter((actual) => actual !== id) : [...value, id]);
  };

  const alternarTodos = () => {
    onChange(todosSeleccionados ? [] : opciones.map((opcion) => opcion.id));
  };

  const resumen = () => {
    if (value.length === 0) return "Seleccionar...";
    if (value.length === 1) {
      const opcion = opciones.find((item) => item.id === value[0]);
      return opcion?.codigo ?? `ID ${value[0]}`;
    }
    if (todosSeleccionados) return `Todos (${value.length})`;
    return `${value.length} seleccionados`;
  };

  const triggerClasses = `
    w-full border bg-input text-foreground rounded-shape-sm px-3 py-2 text-sm outline-none transition-colors text-left flex justify-between items-center gap-2 cursor-pointer
    ${error ? "border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
  `.trim().replace(/\s+/g, " ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-foreground">{label}</label>

      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild disabled={disabled}>
          <button type="button" className={triggerClasses}>
            <span className={value.length === 0 ? "text-foreground-disabled" : ""}>{resumen()}</span>
            <IconifyIcon variant="chevronDown" className="text-lg shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0 z-[1300] border-border bg-background-paper text-foreground shadow-card rounded-shape-sm"
        >
          <Command>
            <CommandInput placeholder="Buscar limnígrafo..." />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>

              {!seleccionUnica && opciones.length > 1 && (
                <CommandGroup>
                  <CommandItem
                    value="__todos__"
                    onSelect={alternarTodos}
                    className="cursor-pointer aria-selected:bg-input-hover"
                  >
                    <IconifyIcon
                      variant={todosSeleccionados ? "check" : "circle"}
                      className={`mr-2 text-base ${todosSeleccionados ? "text-primary" : "text-foreground-disabled text-[6px]"}`}
                    />
                    {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandGroup>
                {opciones.map((opcion) => {
                  const activo = seleccionados.has(opcion.id);
                  return (
                    <CommandItem
                      key={opcion.id}
                      // cmdk filtra por este valor: incluye la descripción para que
                      // se pueda buscar por nombre de estación y no sólo por código.
                      value={`${opcion.codigo} ${opcion.descripcion ?? ""}`}
                      onSelect={() => alternar(opcion.id)}
                      className="cursor-pointer aria-selected:bg-input-hover"
                    >
                      <IconifyIcon
                        variant={activo ? "check" : "circle"}
                        className={`mr-2 text-base ${activo ? "text-primary" : "text-foreground-disabled text-[6px]"}`}
                      />
                      <span className="flex flex-col">
                        <span>{opcion.codigo}</span>
                        {opcion.descripcion && (
                          <span className="text-xs text-foreground-secondary">{opcion.descripcion}</span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  );
}
