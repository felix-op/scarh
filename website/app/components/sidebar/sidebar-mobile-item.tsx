"use client";

import { useRouter, usePathname } from "next/navigation";
import { IconifyIcon } from "../ui/iconify-icon";
import { Menu, type MenuItemConfig } from "../ui/menu";
import { esGrupo, type SidebarGroup, type SidebarLink, type SidebarNavItem } from "./sidebar-item";

function SidebarMobileLeaf({ item }: { item: SidebarLink }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

  return (
    <button
      type="button"
      onClick={() => router.push(item.href)}
      aria-label={item.label}
      title={item.label}
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-shape-md ${
        isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
      }`}
    >
      <IconifyIcon variant={item.icono} className="text-3xl shrink-0" />
    </button>
  );
}

function SidebarMobileGroup({ item }: { item: SidebarGroup }) {
  const pathname = usePathname();
  const router = useRouter();
  const algunHijoActivo = item.children.some((child) => pathname.startsWith(child.href));

  const menuItems: MenuItemConfig[] = item.children.map((child) => ({
    label: child.label,
    icon: child.icono,
    action: () => router.push(child.href),
  }));

  return (
    <Menu
      items={menuItems}
      ariaLabel={`Abrir menú de ${item.label}`}
      side="bottom"
      align="start"
      trigger={
        <button
          type="button"
          aria-label={item.label}
          title={item.label}
          className={`flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-shape-md border-0 ${
            algunHijoActivo ? "bg-sidebar-link-active text-sidebar-foreground-active" : "button-sidebar"
          }`}
        >
          <IconifyIcon variant={item.icono} className="text-3xl shrink-0" />
        </button>
      }
    />
  );
}

export function SidebarMobileItem({ item }: { item: SidebarNavItem }) {
  if (esGrupo(item)) return <SidebarMobileGroup item={item} />;
  return <SidebarMobileLeaf item={item} />;
}
