"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@services";
import { Menu, type MenuItemConfig } from "../ui/menu";

export interface SidebarProfileMenuProps {
  triggerClassName?: string;
}

export function SidebarProfileMenu({ triggerClassName = "" }: SidebarProfileMenuProps) {
  const router = useRouter();
  const { toggleTheme, getActualTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getActualTheme() === "dark");
    const handleThemeChange = () => setIsDark(getActualTheme() === "dark");
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [getActualTheme]);

  const items: MenuItemConfig[] = [
    { label: "Ver perfil", icon: "user1", action: () => router.push("/dashboard/perfil") },
    { label: `Tema ${isDark ? "Claro" : "Oscuro"}`, icon: isDark ? "sol" : "luna", action: toggleTheme },
    {
      label: "Cerrar sesión",
      icon: "logout",
      action: () => signOut({ callbackUrl: "/login" }),
      className: "text-error hover:bg-error-light hover:text-error",
    },
  ];

  return <Menu items={items} ariaLabel="Abrir menú de usuario" triggerClassName={triggerClassName} />;
}
