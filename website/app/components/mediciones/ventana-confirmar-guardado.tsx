"use client";

import { VentanaConfirmar } from "../ui/modals";

interface VentanaConfirmarGuardadoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicateCount: number;
  remainingCount: number;
  isLoading?: boolean;
}

export function VentanaConfirmarGuardado({
  isOpen,
  onClose,
  onConfirm,
  duplicateCount,
  remainingCount,
  isLoading = false,
}: VentanaConfirmarGuardadoProps) {
  return (
    <VentanaConfirmar
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="warn"
      title="Hay registros duplicados"
      description={`Hay ${duplicateCount} ${duplicateCount === 1 ? "registro" : "registros"} que ya existen (en el archivo o en la base de datos). ¿Querés ignorarlos e importar los ${remainingCount} restantes?`}
      confirmText="Importar los demás"
      cancelText="Cancelar"
      isLoading={isLoading}
    />
  );
}
