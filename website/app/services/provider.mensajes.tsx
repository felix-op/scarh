"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MensajeFlotante } from "@/components/ui/mensaje-flotante";

export type MensajeType = "alert" | "error" | "info" | "success";

export interface Mensaje {
  id: string;
  type: MensajeType;
  title: string;
  content?: string;
  tiempo: boolean | number;
}

export type MensajeFuncion = (_title: string, _content?: string, _tiempo?: boolean | number) => void;

interface MensajesContextValue {
  alert: MensajeFuncion;
  error: MensajeFuncion;
  info: MensajeFuncion;
  success: MensajeFuncion;
}

const MensajesContext = createContext<MensajesContextValue | undefined>(undefined);

export function MensajesProvider({ children }: { children: ReactNode }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const addMensaje = (type: MensajeType, title: string, content?: string, tiempo: boolean | number = true) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMensajes((prev) => [...prev, { id, type, title, content, tiempo }]);
  };

  const removeMensaje = (id: string) => {
    setMensajes((prev) => prev.filter((m) => m.id !== id));
  };

  const contextValue: MensajesContextValue = {
    alert: (title, content, tiempo) => addMensaje("alert", title, content, tiempo),
    error: (title, content, tiempo) => addMensaje("error", title, content, tiempo),
    info: (title, content, tiempo) => addMensaje("info", title, content, tiempo),
    success: (title, content, tiempo) => addMensaje("success", title, content, tiempo),
  };

  return (
    <MensajesContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {mensajes.map((mensaje) => (
          <MensajeFlotante key={mensaje.id} mensaje={mensaje} onRemove={removeMensaje} />
        ))}
      </div>
    </MensajesContext.Provider>
  );
}

export function useMensajes() {
  const context = useContext(MensajesContext);
  if (!context) {
    throw new Error("useMensajes debe usarse dentro de un MensajesProvider");
  }
  return context;
}
