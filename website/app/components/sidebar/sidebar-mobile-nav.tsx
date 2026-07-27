"use client";

import type { Usuario } from "@models";
import { ROLES } from "@utils";
import { filtrarNav, type SidebarNavItem } from "./sidebar-item";
import { SidebarMobileItem } from "./sidebar-mobile-item";

const MOBILE_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", icono: "dashboard", href: "/dashboard" },
  {
    label: "Limnígrafos",
    icono: "chip",
    children: [
      { label: "Mapa", icono: "mapa", href: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
      { label: "Limnígrafos", icono: "chip", href: "/dashboard/limnigrafos", permiso: ROLES.LIMNIGRAFOS_VISUALIZAR },
    ],
  },
  {
    label: "Mediciones",
    icono: "documento",
    children: [
      { label: "Mediciones", icono: "documento", href: "/dashboard/mediciones", permiso: ROLES.MEDICIONES_VISUALIZAR },
      { label: "Estadísticas", icono: "funcion", href: "/dashboard/estadisticas", permiso: ROLES.ESTADISTICAS_VISUALIZAR },
    ],
  },
  {
    label: "Administración",
    icono: "tuerca",
    children: [
      { label: "Usuarios", icono: "user1", href: "/dashboard/admin/usuarios", permiso: ROLES.USUARIOS_VISUALIZAR },
      { label: "Historial", icono: "historial", href: "/dashboard/admin/historial", permiso: ROLES.HISTORIAL_VISUALIZAR },
      {
        label: "Documentación",
        icono: "documentacion",
        href: "/dashboard/admin/documentacion",
        permiso: ROLES.ADMINISTRACION,
      },
    ],
  },
];

export interface SidebarMobileNavProps {
  usuario: Usuario;
}

export function SidebarMobileNav({ usuario }: SidebarMobileNavProps) {
  const items = filtrarNav(MOBILE_NAV_ITEMS, usuario);

  return (
    <nav className="fixed inset-x-0 bottom-2 z-[1100] mx-auto flex w-[90%] items-center justify-around gap-1 overflow-x-auto rounded-shape-lg bg-sidebar p-2 font-outfit shadow-card md:hidden">
      {items.map((item) => (
        <SidebarMobileItem key={item.label} item={item} />
      ))}
    </nav>
  );
}
