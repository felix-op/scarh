"use client";

import React from "react";
import { VentanaConfirmar } from "../ui/modals";

export interface VentanaEliminarProps<T> {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  elemento?: T | null;
  accessorKey?: keyof T;
  handleOpen?: (el: T) => string;
  title?: string;
  isLoading?: boolean;
}

export function VentanaEliminar<T>({
  open,
  onClose,
  onConfirm,
  elemento,
  accessorKey,
  handleOpen,
  title = "Eliminar",
  isLoading = false,
}: VentanaEliminarProps<T>) {
  const getNombre = (): string => {
    if (!elemento) return "el elemento";
    if (handleOpen) return handleOpen(elemento);
    if (accessorKey && elemento[accessorKey] !== undefined) {
      return String(elemento[accessorKey]);
    }
    // Fallbacks si tiene campos comunes
    const anyEl = elemento as any;
    if (anyEl.nombre) return anyEl.nombre;
    if (anyEl.name) return anyEl.name;
    if (anyEl.nombre_usuario) return anyEl.nombre_usuario;
    if (anyEl.username) return anyEl.username;
    
    return "el elemento";
  };

  const name = getNombre();

  return (
    <VentanaConfirmar
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={`¿Está seguro que desea eliminar ${name}?`}
      variant="eliminar"
      confirmText="Eliminar"
      isLoading={isLoading}
    />
  );
}

export default VentanaEliminar;
