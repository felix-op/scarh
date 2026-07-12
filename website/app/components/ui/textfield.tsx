import React, { forwardRef, ReactNode } from "react";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  leftIcon?: ReactNode;
  rightAction?: {
    icon: ReactNode;
    handler: () => void;
  };
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      name,
      errors,
      disabled = false,
      required = false,
      type = "text",
      leftIcon,
      rightAction,
      className = "",
      ...props
    },
    ref
  ) => {
    const hasError = errors && errors.length > 0;
    
    // Configurar espaciado condicional según los iconos laterales
    const inputClasses = `
      w-full border-2 bg-input text-foreground rounded-shape-sm py-2 text-sm outline-none transition-colors
      ${leftIcon ? "pl-10" : "pl-2"}
      ${rightAction ? "pr-10" : "pr-2"}
      ${hasError ? "border-error focus:border-error" : "border-input-border focus:border-input-focus"}
      ${disabled ? "bg-input-disabled text-foreground-disabled cursor-not-allowed opacity-60" : ""}
      ${className}
    `.trim().replace(/\s+/g, " ");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Etiqueta */}
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-error">*</span>}
        </label>

        {/* Contenedor relativo del Input */}
        <div className="relative flex items-center w-full">
          {/* Icono Izquierdo */}
          {leftIcon && (
            <span className="absolute left-3 pointer-events-none text-foreground-disabled flex items-center justify-center">
              {leftIcon}
            </span>
          )}

          {/* Input de Texto */}
          <input
            id={name}
            name={name}
            type={type}
            disabled={disabled}
            required={required}
            ref={ref}
            className={inputClasses}
            {...props}
          />

          {/* Acción Derecha */}
          {rightAction && (
            <button
              type="button"
              onClick={rightAction.handler}
              disabled={disabled}
              className="absolute right-2 flex items-center justify-center p-1.5 rounded-full hover:bg-input-hover text-foreground-disabled hover:text-foreground outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rightAction.icon}
            </button>
          )}
        </div>

        {/* Error debajo */}
        {hasError && (
          <span className="text-xs text-error font-medium">{errors[0]}</span>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";
export default TextField;
