"use client";

import { useEffect, useRef, type Ref, type InputHTMLAttributes } from "react";

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  indeterminate?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function RadioButton({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  checked,
  onChange,
  className = "",
  indeterminate = false,
  ref,
  ...props
}: RadioButtonProps) {
  const localRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localRef.current) {
      localRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const hasError = errors && errors.length > 0;
  const inputClasses = `
    w-4 h-4 rounded-full border bg-white text-primary-main accent-primary-main outline-none cursor-pointer transition-all
    ${hasError ? "border-error focus-visible:ring-error" : "border-default focus-visible:ring-input-focus"}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <input
      type="radio"
      id={name}
      name={name}
      checked={checked}
      disabled={disabled}
      required={required}
      onChange={(e) => onChange?.(e.target.checked)}
      className={inputClasses}
      ref={(node) => {
        if (localRef) (localRef as any).current = node;
        if (ref) {
          if (typeof ref === "function") ref(node);
          else (ref as any).current = node;
        }
      }}
      {...props}
    />
  );
}

export interface RadioFieldProps extends Omit<RadioButtonProps, "label"> {
  label: string;
  description?: string;
}

export function RadioField({
  label,
  name,
  id,
  description,
  errors,
  disabled = false,
  required = false,
  checked,
  onChange,
  className = "",
  indeterminate = false,
  ref,
  ...props
}: RadioFieldProps) {
  const hasError = errors && errors.length > 0;
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center gap-2.5 py-1">
        <RadioButton
          id={inputId}
          name={name}
          checked={checked}
          disabled={disabled}
          required={required}
          onChange={onChange}
          indeterminate={indeterminate}
          errors={errors}
          ref={ref}
          {...props}
        />
        {label ? (
          <label
            htmlFor={inputId}
            className={`text-sm text-foreground select-none ${
              disabled ? "text-foreground-disabled cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {description || label}
          </label>
        ) : null}
      </div>

      {hasError && (
        <span className="text-xs text-error font-medium">{errors[0]}</span>
      )}
    </div>
  );
}
