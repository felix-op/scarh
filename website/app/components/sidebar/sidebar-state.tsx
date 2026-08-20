"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const COLLAPSE_KEY = "scarh-sidebar-collapsed";

interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarStateContext = createContext<SidebarState | undefined>(undefined);

/** Estado compartido para que el comando del header y el panel lateral actúen sobre el mismo sidebar. */
export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((actual) => {
      const siguiente = !actual;
      localStorage.setItem(COLLAPSE_KEY, String(siguiente));
      return siguiente;
    });
  };

  return <SidebarStateContext.Provider value={{ collapsed, toggleCollapsed }}>{children}</SidebarStateContext.Provider>;
}

export function useSidebarState() {
  const state = useContext(SidebarStateContext);
  if (!state) throw new Error("useSidebarState debe ser usado dentro de SidebarStateProvider");
  return state;
}
