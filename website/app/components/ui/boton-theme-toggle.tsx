"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@services";
import { BotonIcono } from "./botones";

export function BotonThemeToggle() {
  const { toggleTheme, getActualTheme } = useTheme();
  const [themeState, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Sincronizar tema inicial al montar en el cliente
    setThemeState(getActualTheme());

    const handleThemeChange = () => {
      setThemeState(getActualTheme());
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, [getActualTheme]);

  const isDark = themeState === "dark";

  return (
    <BotonIcono
      icon={isDark ? "sol" : "luna"}
      onClick={toggleTheme}
    />
  );
}
export default BotonThemeToggle;
