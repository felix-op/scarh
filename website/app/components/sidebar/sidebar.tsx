"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Usuario } from "@models";
import { ROLES } from "@utils";
import { SidebarItem, esGrupo, filtrarNav, type SidebarNavItem } from "./sidebar-item";
import { useSidebarState } from "./sidebar-state";

const NAV_ITEMS: SidebarNavItem[] = [
  { label: "Inicio", icono: "inicio", href: "/dashboard" },
  { label: "Mapa", icono: "mapa", href: "/dashboard/mapa", permiso: ROLES.MAPA_VISUALIZAR },
  { label: "Limnígrafos", icono: "chip", href: "/dashboard/limnigrafos", permiso: ROLES.LIMNIGRAFOS_VISUALIZAR },
  { label: "Mediciones", icono: "documento", href: "/dashboard/mediciones", permiso: ROLES.MEDICIONES_VISUALIZAR },
  { label: "Estadísticas", icono: "funcion", href: "/dashboard/estadisticas", permiso: ROLES.ESTADISTICAS_VISUALIZAR },
  { label: "Usuarios", icono: "user1", href: "/dashboard/admin/usuarios", permiso: ROLES.USUARIOS_VISUALIZAR },
  { label: "Historial", icono: "historial", href: "/dashboard/admin/historial", permiso: ROLES.HISTORIAL_VISUALIZAR },
  { label: "Documentación", icono: "documentacion", href: "/dashboard/admin/documentacion", permiso: ROLES.ADMINISTRACION },
];

export interface SidebarProps {
  usuario: Usuario;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const items = filtrarNav(NAV_ITEMS, usuario);

  const { collapsed } = useSidebarState();
  // Igual que los SidebarItem: el logo recién se centra cuando terminó de ocultarse el texto.
  const [logoCentrado, setLogoCentrado] = useState(collapsed);
  const [openGroup, setOpenGroup] = useState<string | null>(
    () => items.find((item) => esGrupo(item) && item.children.some((child) => pathname.startsWith(child.href)))?.label ?? null,
  );

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLogoCentrado(collapsed), collapsed ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [collapsed]);

  return (
    <aside className={`hidden md:flex h-full shrink-0 bg-sidebar font-outfit transition-[width] duration-300 ease-in-out ${collapsed ? "w-24" : "w-60"}`}>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 pl-4">
        <div className="flex h-12 w-full items-center">
          <div className={`flex w-full items-center overflow-hidden px-1 transition-[gap] duration-300 ease-in-out ${logoCentrado ? "justify-center gap-0" : "gap-3"}`}>
            <img src="/logo.png" alt="Logo de SCARH" className="h-10 w-10 shrink-0" />
            <span
              className="overflow-hidden whitespace-nowrap truncate text-xl font-bold text-logo uppercase transition-[max-width] duration-300 ease-in-out"
              style={{ maxWidth: collapsed ? 0 : "8rem" }}
            >
              SCARH
            </span>
          </div>
        </div>

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
