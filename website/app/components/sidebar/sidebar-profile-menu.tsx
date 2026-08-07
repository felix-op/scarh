"use client";

import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@services";
import { useConteoAlertasNoLeidas } from "@hooks";
import { Menu, type MenuItemConfig } from "../ui/menu";
import { VentanaNotificaciones } from "../alertas/ventana-notificaciones";

export interface SidebarProfileMenuProps {
  triggerClassName?: string;
  trigger?: ReactNode;
}

export function SidebarProfileMenu({ triggerClassName = "", trigger }: SidebarProfileMenuProps) {
  const router = useRouter();
  const { toggleTheme, getActualTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const { data: sinLeer } = useConteoAlertasNoLeidas();

  useEffect(() => {
    setIsDark(getActualTheme() === "dark");
    const handleThemeChange = () => setIsDark(getActualTheme() === "dark");
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [getActualTheme]);

  const items: MenuItemConfig[] = [
    {
      label: sinLeer ? `Notificaciones (${sinLeer})` : "Notificaciones",
      icon: "newNotification",
      action: () => setNotificacionesAbiertas(true),
    },
    { label: "Ver perfil", icon: "user1", action: () => router.push("/dashboard/perfil") },
    { label: `Tema ${isDark ? "Claro" : "Oscuro"}`, icon: isDark ? "sol" : "luna", action: toggleTheme },
    {
      label: "Cerrar sesión",
      icon: "logout",
      action: () => signOut({ callbackUrl: "/login" }),
      className: "text-error hover:bg-error-light hover:text-error",
    },
  ];

  return (
    <>
      <Menu
        items={items}
        ariaLabel="Abrir menú de usuario"
        triggerClassName={triggerClassName}
        trigger={trigger}
        size="lg"
      />
      {/* Hermano del menú, no hijo: el dropdown de Radix se desmonta al elegir el ítem
          y se llevaría puesta la ventana si colgara de él. */}
      <VentanaNotificaciones
        open={notificacionesAbiertas}
        handleClose={() => setNotificacionesAbiertas(false)}
      />
    </>
  );
}
