"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import { IconifyIcon } from "../ui/iconify-icon";

export interface MultiCheckboxOption {
  label: string;
  value: string;
}

export interface MultiCheckboxRHFProps {
  name: string;
  options: MultiCheckboxOption[];
  label?: string;
  /** Clases del grid de opciones (ej. `md:grid-cols-2`). */
  className?: string;
  disabled?: boolean;
  required?: boolean;
  rules?: RegisterOptions;
}

/** Grupo de checkboxes (RHF) enlazado a un array de `string`. */
export function MultiCheckboxRHF({
  name,
  options,
  label,
  className = "",
  disabled = false,
  required = false,
  rules,
}: MultiCheckboxRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];
  const isDisabled = disabled || formState.isSubmitting;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const toggle = (value: string) => {
          if (isDisabled) return;
          const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
          field.onChange(next);
        };

        return (
          <div className="flex flex-col gap-1.5 w-full">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label} {required && <span className="text-error">*</span>}
              </span>
            )}

            <div className={`grid gap-2 ${className}`.trim()}>
              {options.map((opt) => {
                const checked = values.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    disabled={isDisabled}
                    className={[
                      "flex items-center gap-2 rounded-shape-sm border px-3 py-2 text-sm text-left transition-colors",
                      checked
                        ? "border-primary bg-primary-light/10 text-foreground"
                        : "border-input-border bg-input text-foreground-secondary hover:bg-hover",
                      isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {checked ? (
                      <IconifyIcon variant="check" className="text-primary text-base" />
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-shape-full border border-input-border" />
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {errorMessages.length > 0 && (
              <span className="text-xs text-error font-medium">{errorMessages[0]}</span>
            )}
          </div>
        );
      }}
    />
  );
}

export default MultiCheckboxRHF;
