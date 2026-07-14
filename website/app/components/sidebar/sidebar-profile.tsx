"use client";

import type { Usuario } from "@models";
import { Avatar } from "../ui/avatar";
import { SidebarProfileMenu } from "./sidebar-profile-menu";

export interface SidebarProfileProps {
  usuario: Usuario;
  collapsed: boolean;
}

export function SidebarProfile({ usuario, collapsed }: SidebarProfileProps) {
  const nombreCompleto = usuario.first_name || usuario.username;

  return (
    <div className="flex h-16 w-full shrink-0 items-center justify-between gap-2 rounded-shape-md bg-sidebar-link px-2">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="sm" nombre={usuario.first_name} apellido={usuario.last_name} username={usuario.username} />
        <span
          className="overflow-hidden inline-block whitespace-nowrap truncate text-sidebar-foreground font-bold transition-[max-width] duration-300 ease-in-out"
          style={{ maxWidth: collapsed ? 0 : "8rem" }}
        >
          {nombreCompleto}
        </span>
      </div>
      {!collapsed && <SidebarProfileMenu />}
    </div>
  );
}
