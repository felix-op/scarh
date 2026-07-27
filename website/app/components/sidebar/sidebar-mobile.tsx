"use client";

import type { Usuario } from "@models";
import { Avatar } from "../ui/avatar";
import { SidebarProfileMenu } from "./sidebar-profile-menu";

export interface SidebarMobileProps {
  usuario: Usuario;
}

export function SidebarMobile({ usuario }: SidebarMobileProps) {
  return (
    <header className="flex w-full shrink-0 items-center justify-between gap-3 bg-sidebar p-3 font-outfit shadow-sm md:hidden">
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
    </header>
  );
}
