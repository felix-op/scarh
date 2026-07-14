import { InputHTMLAttributes, Ref } from "react";

export interface TimeFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  ref?: Ref<HTMLInputElement>; // ref nativo de React 19
}

export function TimeField({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  className = "",
  ref,
  ...props
}: TimeFieldProps) {
  const hasError = errors && errors.length > 0;
  const inputClasses = `
    w-full border bg-input text-foreground rounded-shape-sm px-3 py-2 text-sm outline-none transition-colors
    ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
    ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label arriba */}
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-error">*</span>}
      </label>

      {/* Input de Hora nativo HTML5 con selector nativo a la derecha */}
      <input
        id={name}
        name={name}
        type="time"
        disabled={disabled}
        required={required}
        ref={ref}
        className={inputClasses}
        {...props}
      />

      {/* Error debajo */}
      {hasError && (
        <span className="text-xs text-error font-medium">{errors[0]}</span>
      )}
    </div>
  );
}

export default TimeField;
