import { TextareaHTMLAttributes, Ref } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  ref?: Ref<HTMLTextAreaElement>; // ref nativo de React 19
}

export function TextArea({
  label,
  name,
  errors,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
  ref,
  ...props
}: TextAreaProps) {
  const hasError = errors && errors.length > 0;

  const textareaClasses = `
    w-full border bg-input text-foreground rounded-shape-sm px-3 py-2 text-sm outline-none transition-colors resize-y
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

      {/* Área de texto */}
      <textarea
        id={name}
        name={name}
        disabled={disabled}
        required={required}
        rows={rows}
        ref={ref}
        className={textareaClasses}
        {...props}
      />

      {/* Error debajo */}
      {hasError && <span className="text-xs text-error font-medium">{errors[0]}</span>}
    </div>
  );
}

export default TextArea;
