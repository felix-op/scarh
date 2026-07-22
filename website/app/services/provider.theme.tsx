"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { THEME_COOKIE } from "./constantes-theme";

export type ThemeMode = "light" | "dark";
export type TextScale = "small" | "medium" | "large" | "xlarge";

interface ThemeContextState {
  getActualTheme: () => ThemeMode;
  toggleTheme: () => void;
  getActualFontSize: () => TextScale;
  setFontSize: (scale: TextScale) => void;
  animations: boolean;
  toggleAnimations: () => void;
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

const FONT_SIZE_KEY = "font-size-preference";
const ANIMATIONS_KEY = "animations-preference";
const THEME_COOKIE_MAX_AGE_DAYS = 365;

function setThemeCookie(value: ThemeMode) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
}

const fontSizeMap: Record<TextScale, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
  xlarge: "20px",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [animations, setAnimations] = useState<boolean>(true);

  // Consultar el tema actual leyendo directamente el DOM para evitar re-renders reactivos
  const getActualTheme = (): ThemeMode => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  };

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    const current = getActualTheme();
    const nextTheme: ThemeMode = current === "light" ? "dark" : "light";

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }

    setThemeCookie(nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  const getActualFontSize = (): TextScale => {
    if (typeof window === "undefined") return "medium";
    const saved = localStorage.getItem(FONT_SIZE_KEY) as TextScale;
    return saved || "medium";
  };

  const setFontSize = (scale: TextScale) => {
    if (typeof window === "undefined") return;
    const sizePx = fontSizeMap[scale] || "16px";
    
    // Aplicar directamente al font-size de la raíz html
    document.documentElement.style.fontSize = sizePx;
    localStorage.setItem(FONT_SIZE_KEY, scale);
    window.dispatchEvent(new Event("font-size-change"));
  };

  const toggleAnimations = () => {
    setAnimations((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) {
          document.documentElement.classList.remove("no-animations");
        } else {
          document.documentElement.classList.add("no-animations");
        }
        localStorage.setItem(ANIMATIONS_KEY, String(next));
      }
      return next;
    });
  };

  // Inicializar preferencias al montar el componente en el cliente
  // (el tema ya llega correcto desde el servidor vía cookie, ver RootLayout)
  useEffect(() => {
    // 1. Inicializar animaciones
    const savedAnimations = localStorage.getItem(ANIMATIONS_KEY);
    const animsActive = savedAnimations !== "false"; // true por defecto
    setAnimations(animsActive);
    if (!animsActive) {
      document.documentElement.classList.add("no-animations");
    } else {
      document.documentElement.classList.remove("no-animations");
    }

    // 2. Inicializar tamaño de fuente
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as TextScale;
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        getActualTheme,
        toggleTheme,
        getActualFontSize,
        setFontSize,
        animations,
        toggleAnimations,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
}
export default ThemeProvider;
