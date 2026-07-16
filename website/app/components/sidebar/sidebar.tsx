"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Usuario } from "@models";
import { ROLES } from "@utils";
import { BotonIcono } from "../ui/botones";
import { SidebarItem, esGrupo, filtrarNav, type SidebarNavItem } from "./sidebar-item";
import { SidebarProfile } from "./sidebar-profile";

const COLLAPSE_KEY = "scarh-sidebar-collapsed";

const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Dashboard", icono: "dashboard", href: "/dashboard" },
  { label: "Mapa", icono: "mapa", href: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
  { label: "Limnígrafos", icono: "chip", href: "/dashboard/limnigrafos", permiso: ROLES.LIMNIGRAFOS_VISUALIZAR },
  { label: "Mediciones", icono: "documento", href: "/dashboard/mediciones", permiso: ROLES.MEDICIONES_VISUALIZAR },
  { label: "Estadísticas", icono: "funcion", href: "/dashboard/estadisticas", permiso: ROLES.ESTADISTICAS_VISUALIZAR },
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

export interface SidebarProps {
  usuario: Usuario;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const items = filtrarNav(NAV_ITEMS, usuario);

  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(
    () => items.find((item) => esGrupo(item) && item.children.some((child) => pathname.startsWith(child.href)))?.label ?? null,
  );

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  const toggleGroup = (label: string) => {
    if (collapsed) {
      setCollapsed(false);
      localStorage.setItem(COLLAPSE_KEY, "false");
    }
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  return (
    <aside className={`hidden md:flex h-full shrink-0 bg-sidebar font-outfit transition-[width] duration-300 ease-in-out ${collapsed ? "w-20" : "w-60"}`}>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 pl-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex w-full justify-end">
            <BotonIcono
              icon={collapsed ? "menu_derecha" : "menu_izquierda"}
              onClick={toggleCollapsed}
            />
          </div>
          <div className="flex items-center gap-3 w-full overflow-hidden px-1">
            <img src="/logo.png" alt="Logo de SCARH" className="min-h-9 min-w-9 h-9 w-9 shrink-0" />
            <span
              className="overflow-hidden whitespace-nowrap truncate text-xl font-bold text-logo uppercase transition-[max-width] duration-300 ease-in-out"
              style={{ maxWidth: collapsed ? 0 : "8rem" }}
            >
              SCARH
            </span>
          </div>
        </div>

        <div className="h-px w-full shrink-0 bg-border" />

        <SidebarProfile usuario={usuario} collapsed={collapsed} />

        <div className="h-px w-full shrink-0 bg-border" />

        <nav className="flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {items.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              isOpen={openGroup === item.label}
              onToggle={() => toggleGroup(item.label)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
