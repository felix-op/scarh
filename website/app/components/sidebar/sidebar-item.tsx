"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Usuario } from "@models";
import { puedeVer } from "@utils";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";
import { Menu, type MenuItemConfig } from "../ui/menu";

export interface SidebarLink {
  label: string;
  icono: IconVariants;
  href: string;
  permiso?: string | string[];
}

export interface SidebarGroup {
  label: string;
  icono: IconVariants;
  children: SidebarLink[];
  permiso?: string | string[];
}

export type SidebarNavItem = SidebarLink | SidebarGroup;

export function esGrupo(item: SidebarNavItem): item is SidebarGroup {
  return "children" in item;
}

export function filtrarNav(items: SidebarNavItem[], usuario: Usuario): SidebarNavItem[] {
  const resultado: SidebarNavItem[] = [];
  for (const item of items) {
    if (esGrupo(item)) {
      const hijosVisibles = item.children.filter((child) => {
        if (child.href === "/dashboard/admin/documentacion") {
          return process.env.NODE_ENV === "development";
        }
        return puedeVer(usuario, child.permiso);
      });
      if (hijosVisibles.length > 0) resultado.push({ ...item, children: hijosVisibles });
      continue;
    }
    if (item.href === "/dashboard/admin/documentacion") {
      if (process.env.NODE_ENV === "development") resultado.push(item);
      continue;
    }
    if (puedeVer(usuario, item.permiso)) resultado.push(item);
  }
  return resultado;
}

interface SidebarItemProps {
  item: SidebarNavItem;
  collapsed: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const COLLAPSE_ANIM_MS = 300;

/** Centra el icono recién después de que el texto terminó de achicarse, para que no "salte" a mitad de la animación. */
function useCentered(collapsed: boolean) {
  const [centered, setCentered] = useState(collapsed);

  useEffect(() => {
    const timeout = setTimeout(() => setCentered(collapsed), collapsed ? COLLAPSE_ANIM_MS : 0);
    return () => clearTimeout(timeout);
  }, [collapsed]);

  return centered;
}

function SidebarLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  return (
    <span
      className="overflow-hidden inline-block whitespace-nowrap truncate transition-[max-width] duration-300 ease-in-out"
      style={{ maxWidth: collapsed ? 0 : "10rem" }}
    >
      {children}
    </span>
  );
}

function SidebarLeaf({ item, collapsed }: { item: SidebarLink; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
  const centered = useCentered(collapsed);

  return (
    <Link
      href={item.href}
      className={`flex items-center h-11 w-full shrink-0 rounded-shape-md px-3 transition-[gap] duration-300 ease-in-out ${centered ? "justify-center gap-0" : "gap-3"} ${
        isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
      }`}
    >
      <IconifyIcon variant={item.icono} className="text-3xl shrink-0" />
      <SidebarLabel collapsed={collapsed}>{item.label}</SidebarLabel>
    </Link>
  );
}

function SidebarGroupItem({
  item,
  collapsed,
  isOpen,
  onToggle,
}: {
  item: SidebarGroup;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const algunHijoActivo = item.children.some((child) => pathname.startsWith(child.href));
  const centered = useCentered(collapsed);

  const trigger = (
    <button
      type="button"
      onClick={collapsed ? undefined : onToggle}
      className={`flex items-center h-11 w-full shrink-0 rounded-shape-md border-0 px-3 cursor-pointer transition-[gap] duration-300 ease-in-out ${centered ? "justify-center gap-0" : "gap-3"} ${
        algunHijoActivo ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
      }`}
    >
      <IconifyIcon variant={item.icono} className="text-3xl shrink-0" />
      <SidebarLabel collapsed={collapsed}>{item.label}</SidebarLabel>
      {!collapsed && (
        <span className="ml-auto shrink-0 overflow-hidden transition-[max-width] duration-300 ease-in-out" style={{ maxWidth: "1.5rem" }}>
          <IconifyIcon
            variant="chevronDown"
            className={`text-lg transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      )}
    </button>
  );

  if (collapsed) {
    const menuItems: MenuItemConfig[] = item.children.map((child) => ({
      label: child.label,
      icon: child.icono,
      action: () => router.push(child.href),
    }));

    return (
      <Menu
        items={menuItems}
        ariaLabel={`Abrir menú de ${item.label}`}
        side="right"
        align="start"
        size="lg"
        trigger={trigger}
      />
    );
  }

  return (
    <div className="flex flex-col w-full">
      {trigger}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-1 pl-4">
            {item.children.map((child) => (
              <SidebarLeaf key={child.href} item={child} collapsed={collapsed} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarItem({ item, collapsed, isOpen = false, onToggle }: SidebarItemProps) {
  if (esGrupo(item)) {
    return <SidebarGroupItem item={item} collapsed={collapsed} isOpen={isOpen} onToggle={onToggle ?? (() => {})} />;
  }
  return <SidebarLeaf item={item} collapsed={collapsed} />;
}
