"use client";

import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { IconifyIcon } from "../ui/iconify-icon";

/**
 * Extrae una descripción embebida en una traza GPX/KML. Busca el primer texto no vacío
 * en `<desc>` → `<cmt>` → `<name>` (también en el namespace GPX). Devuelve "" si no hay nada.
 */
async function extraerDescripcionTraza(file: File): Promise<string> {
  try {
    const texto = await file.text();
    if (!texto.trim()) return "";

    const doc = new DOMParser().parseFromString(texto, "application/xml");
    if (doc.querySelector("parsererror")) return "";

    const buscar = (tag: string): string => {
      for (const el of Array.from(doc.getElementsByTagName(tag))) {
        const valor = el.textContent?.trim();
        if (valor) return valor;
      }
      for (const el of Array.from(doc.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", tag))) {
        const valor = el.textContent?.trim();
        if (valor) return valor;
      }
      return "";
    };

    return buscar("desc") || buscar("cmt") || buscar("name");
  } catch {
    return "";
  }
}

export interface SugerenciaObservacionRutaProps {
  /** Nombre del campo del formulario que contiene el `File` de la traza. */
  archivoFieldName: string;
  /** Nombre del campo de observaciones que se completará al aceptar la sugerencia. */
  observacionFieldName: string;
}

/**
 * Observa el campo de archivo del formulario; cuando cambia a un GPX/KML con una descripción
 * embebida, ofrece usarla como observación (opt-in). Si no encuentra nada, no renderiza nada.
 */
export function SugerenciaObservacionRuta({ archivoFieldName, observacionFieldName }: SugerenciaObservacionRutaProps) {
  const { control, setValue } = useFormContext();
  const archivo = useWatch({ control, name: archivoFieldName });
  const [sugerencia, setSugerencia] = useState("");

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const texto = archivo instanceof File ? await extraerDescripcionTraza(archivo) : "";
      if (!cancelado) setSugerencia(texto);
    })();

    return () => {
      cancelado = true;
    };
  }, [archivo]);

  if (!sugerencia) return null;

  return (
    <div className="flex flex-col gap-2 rounded-shape-sm border border-border bg-background-muted p-3">
      <div className="flex items-start gap-2">
        <IconifyIcon variant="documento" className="mt-0.5 text-base text-foreground-secondary" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground-secondary">El archivo incluye una descripción:</span>
          <p className="line-clamp-3 text-sm text-foreground">{sugerencia}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setValue(observacionFieldName, sugerencia, { shouldDirty: true })}
        className="self-start text-sm font-medium text-primary hover:underline"
      >
        Usar como observación
      </button>
    </div>
  );
}

export default SugerenciaObservacionRuta;
