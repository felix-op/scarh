"use client";

import { VentanaConfirmar } from "../ui/modals";

interface VentanaEliminarMedicionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rowNumber: number | null;
}

export function VentanaEliminarMedicion({
  isOpen,
  onClose,
  onConfirm,
  rowNumber,
}: VentanaEliminarMedicionProps) {
  return (
    <VentanaConfirmar
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      variant="eliminar"
      title="Eliminar fila de importación"
      description={`¿Estás seguro que querés descartar la fila Nº ${rowNumber}? Esta acción no se puede deshacer y la medición no será importada a la base de datos.`}
      confirmText="Eliminar fila"
      cancelText="Cancelar"
    />
  );
}
