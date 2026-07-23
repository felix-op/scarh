"use client";

import { Menu, type MenuItemConfig } from "../ui/menu";
import type { LimnigrafoResponse } from "@models";

interface LimnigrafoMapaMenuProps {
  limnigrafo: LimnigrafoResponse;
  tieneUbicacion: boolean;
  onMoverUbicacion: (limnigrafo: LimnigrafoResponse) => void;
  onEditarUbicacion: (limnigrafo: LimnigrafoResponse) => void;
  onVerEnMapa: (limnigrafo: LimnigrafoResponse) => void;
  onQuitarUbicacion: (limnigrafo: LimnigrafoResponse) => void;
}

export function LimnigrafoMapaMenu({
  limnigrafo,
  tieneUbicacion,
  onMoverUbicacion,
  onEditarUbicacion,
  onVerEnMapa,
  onQuitarUbicacion,
}: LimnigrafoMapaMenuProps) {
  const items: MenuItemConfig[] = tieneUbicacion
    ? [
        { label: "Mover ubicación", icon: "ubicacion", action: () => onMoverUbicacion(limnigrafo) },
        { label: "Editar ubicación", icon: "editar", action: () => onEditarUbicacion(limnigrafo) },
        { label: "Ver en el mapa", icon: "ver", action: () => onVerEnMapa(limnigrafo) },
        {
          label: "Quitar ubicación",
          icon: "eliminar",
          className: "text-error",
          action: () => onQuitarUbicacion(limnigrafo),
        },
      ]
    : [{ label: "Agregar ubicación", icon: "ubicacion", action: () => onMoverUbicacion(limnigrafo) }];

  return (
    <Menu
      items={items}
      ariaLabel={`Acciones de ${limnigrafo.codigo}`}
      side="left"
      align="start"
      className="z-[1100]"
    />
  );
}

export default LimnigrafoMapaMenu;
