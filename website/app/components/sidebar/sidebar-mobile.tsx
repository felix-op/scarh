"use client";

import type { Usuario } from "@models";
import { ROLES } from "@utils";
import { Avatar } from "../ui/avatar";
import { filtrarNav, type SidebarNavItem } from "./sidebar-item";
import { SidebarMobileItem } from "./sidebar-mobile-item";
import { SidebarProfileMenu } from "./sidebar-profile-menu";

const MOBILE_NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", icono: "dashboard", href: "/dashboard" },
  {
    label: "Limnígrafos",
    icono: "chip",
    children: [
      { label: "Configuración", icono: "mapa", href: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
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

export interface SidebarMobileProps {
  usuario: Usuario;
}

export function SidebarMobile({ usuario }: SidebarMobileProps) {
  const items = filtrarNav(MOBILE_NAV_ITEMS, usuario);

  return (
    <header className="flex w-full shrink-0 flex-col gap-2 bg-sidebar p-3 font-outfit md:hidden">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/logo.png" alt="Logo de SCARH" className="h-9 w-9 shrink-0" />
          <span className="truncate text-xl font-bold text-logo uppercase">SCARH</span>
        </div>
        <SidebarProfileMenu
          trigger={
            <button
              type="button"
              aria-label="Abrir menú de usuario"
              className="shrink-0 cursor-pointer border-0 bg-transparent p-0"
            >
              <Avatar size="sm" nombre={usuario.first_name} apellido={usuario.last_name} username={usuario.username} />
            </button>
          }
        />
      </div>

      <nav className="flex w-full items-center gap-2 overflow-x-auto">
        {items.map((item) => (
          <SidebarMobileItem key={item.label} item={item} />
        ))}
      </nav>
    </header>
  );
}
