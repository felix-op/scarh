"use client";

import { useState, useEffect } from "react";
import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import { IconifyIcon } from "../ui/iconify-icon";

export interface FileFieldRHFProps {
  name: string;
  label: string;
  accept?: string;
  /** Tamaño máximo en MB. */
  maxSizeMB?: number;
  required?: boolean;
  disabled?: boolean;
  rules?: RegisterOptions;
  helperText?: string;
  existingFileName?: string;
}

/**
 * Campo de archivo (RHF) enlazado a un `File | null`. Valida extensión (según `accept`)
 * y tamaño máximo localmente. Se usa para cargar la traza GPX/KML de una ruta de acceso.
 */
export function FileFieldRHF({
  name,
  label,
  accept = ".gpx,.kml",
  maxSizeMB = 5,
  required = false,
  disabled = false,
  rules,
  helperText,
  existingFileName,
}: FileFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];
  const isDisabled = disabled || formState.isSubmitting;
  const [localError, setLocalError] = useState<string>("");
  const [fileName, setFileName] = useState<string>(existingFileName || "");

  useEffect(() => {
    setFileName(existingFileName || "");
  }, [existingFileName]);

  const extensionesValidas = accept
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setLocalError("");
          const file = e.target.files?.[0] ?? null;

          if (!file) {
            setFileName("");
            field.onChange(null);
            return;
          }

          const nombre = file.name.toLowerCase();
          const extOk = extensionesValidas.some((ext) => nombre.endsWith(ext));
          if (!extOk) {
            setLocalError(`El archivo debe ser ${extensionesValidas.join(" o ")}`);
            setFileName("");
            field.onChange(null);
            e.target.value = "";
            return;
          }

          if (file.size > maxSizeMB * 1024 * 1024) {
            setLocalError(`El archivo no puede superar los ${maxSizeMB} MB`);
            setFileName("");
            field.onChange(null);
            e.target.value = "";
            return;
          }

          setFileName(file.name);
          field.onChange(file);
        };

        const mensajes = localError ? [localError] : errorMessages;
        const hasError = mensajes.length > 0;

        return (
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor={name} className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-error">*</span>}
            </label>

            <label
              htmlFor={name}
              className={[
                "flex items-center gap-2 rounded-shape-sm border border-dashed px-3 py-3 text-sm transition-colors",
                hasError ? "border-error" : "border-input-border hover:bg-hover",
                isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              <IconifyIcon variant="file" className="text-lg text-foreground-secondary" />
              <span className={fileName ? "text-foreground" : "text-foreground-secondary"}>
                {fileName || "Seleccionar archivo…"}
              </span>
              <input
                id={name}
                name={name}
                type="file"
                accept={accept}
                disabled={isDisabled}
                onChange={handleChange}
                className="hidden"
              />
            </label>

            {helperText && !hasError && (
              <span className="text-xs text-foreground-secondary">{helperText}</span>
            )}
            {hasError && <span className="text-xs text-error font-medium">{mensajes[0]}</span>}
          </div>
        );
      }}
    />
  );
}

export default FileFieldRHF;
