"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Usuario } from "@models";
import { puedeVer } from "@utils";
import { IconifyIcon, type IconVariants } from "../ui/iconify-icon";

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

  return (
    <Link
      href={item.href}
      className={`flex items-center h-11 w-full shrink-0 gap-3 rounded-shape-md px-3 ${
        isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
      }`}
    >
      <IconifyIcon variant={item.icono} className="text-xl shrink-0" />
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
  const algunHijoActivo = item.children.some((child) => pathname.startsWith(child.href));

  return (
    <div className="flex flex-col w-full">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center h-11 w-full shrink-0 gap-3 rounded-shape-md border-0 px-3 cursor-pointer ${
          algunHijoActivo ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
        }`}
      >
        <IconifyIcon variant={item.icono} className="text-xl shrink-0" />
        <SidebarLabel collapsed={collapsed}>{item.label}</SidebarLabel>
        <span
          className="ml-auto shrink-0 overflow-hidden transition-[max-width] duration-300 ease-in-out"
          style={{ maxWidth: collapsed ? 0 : "1.5rem" }}
        >
          <IconifyIcon
            variant="chevronDown"
            className={`text-lg transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>
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
