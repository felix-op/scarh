"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Usuario } from "@models";
import { useTheme } from "@services";
import { useConteoAlertasNoLeidas } from "@hooks";
import { VentanaNotificaciones } from "../alertas/ventana-notificaciones";
import { useSidebarState } from "../sidebar/sidebar-state";
import { Avatar, BotonIconoHeader } from "../ui";
import { HeaderFechaHora } from "./header-fecha-hora";

interface RutaHeader {
  href: string;
  titulo: string;
}

const RUTAS: RutaHeader[] = [
  { href: "/dashboard/admin/documentacion", titulo: "Documentación" },
  { href: "/dashboard/admin/usuarios", titulo: "Administración de Usuarios" },
  { href: "/dashboard/admin/historial", titulo: "Historial de Acciones" },
  { href: "/dashboard/limnigrafos/importar", titulo: "Importar mediciones" },
  { href: "/dashboard/limnigrafos/editar", titulo: "Editar limnígrafo" },
  { href: "/dashboard/limnigrafos", titulo: "Gestión de Limnígrafos" },
  { href: "/dashboard/mediciones", titulo: "Mediciones" },
  { href: "/dashboard/estadisticas", titulo: "Estadísticas" },
  { href: "/dashboard/alertas", titulo: "Alertas" },
  { href: "/dashboard/perfil", titulo: "Mi perfil" },
  { href: "/dashboard/mapa", titulo: "Mapa" },
  { href: "/dashboard", titulo: "Inicio" },
];

function obtenerRuta(pathname: string): RutaHeader {
  return RUTAS.find((ruta) => pathname === ruta.href || pathname.startsWith(`${ruta.href}/`)) ?? RUTAS.at(-1)!;
}

export interface HeaderProps {
  usuario: Usuario;
}

/** Barra común del área autenticada: identifica la vista y concentra las acciones de sesión. */
export function Header({ usuario }: HeaderProps) {
  const pathname = usePathname();
  const { titulo } = obtenerRuta(pathname);
  const { toggleTheme } = useTheme();
  const { data: alertasSinLeer } = useConteoAlertasNoLeidas();
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();
  const nombreCompleto = usuario.first_name || usuario.username;

  return (
    <>
      <header className="hidden h-18 w-full shrink-0 items-center justify-between gap-3 border-b border-border bg-sidebar px-3 py-2 font-outfit shadow-sm md:flex md:px-4 2xl:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden md:block">
            <BotonIconoHeader
              icon={collapsed ? "menu_derecha" : "menu_izquierda"}
              aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
              onClick={toggleCollapsed}
            />
          </span>
          <h1 className="mb-0 truncate text-2xl font-bold leading-none text-foreground md:text-3xl">{titulo}</h1>
          <HeaderFechaHora />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span className="relative">
            <BotonIconoHeader
              icon="notificacion"
              aria-label={alertasSinLeer ? `Ver notificaciones (${alertasSinLeer})` : "Ver notificaciones"}
              className="text-primary"
              onClick={() => setNotificacionesAbiertas(true)}
            />
            {!!alertasSinLeer && (
              <span className="absolute bottom-0 right-0 flex min-w-4 translate-y-1/4 translate-x-1/4 items-center justify-center rounded-shape-full bg-error px-1 text-xs font-bold leading-4 text-error-contrast">
                {alertasSinLeer > 9 ? "9+" : alertasSinLeer}
              </span>
            )}
          </span>
          <BotonIconoHeader
            icon={isDark ? "sol" : "luna"}
            aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
            onClick={() => {
              toggleTheme();
              setIsDark((actual) => !actual);
            }}
          />
          <Link
            href="/dashboard/perfil"
            aria-label="Ver mi perfil"
            className="flex min-w-0 items-center gap-2 rounded-shape-full border border-border bg-background-paper px-3 py-2 text-foreground shadow-sm transition-colors hover:bg-background-muted"
          >
            <Avatar size="sm" nombre={usuario.first_name} apellido={usuario.last_name} username={usuario.username} />
            <span className="hidden max-w-36 truncate font-bold sm:inline">{nombreCompleto}</span>
          </Link>
          <BotonIconoHeader
            icon="logout"
            aria-label="Cerrar sesión"
            className="button-icon-header-error"
            onClick={() => signOut({ callbackUrl: "/login" })}
          />
        </div>
      </header>
      <VentanaNotificaciones open={notificacionesAbiertas} handleClose={() => setNotificacionesAbiertas(false)} />
    </>
  );
}

export default Header;
