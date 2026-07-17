"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import TextField, { TextFieldProps } from "@/components/ui/textfield";
import { ReactNode } from "react";

export interface TextFieldRHFProps
  extends Omit<TextFieldProps, "errors" | "onChange" | "value" | "defaultValue"> {
  name: string;
  rules?: RegisterOptions;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAction?: {
    icon: ReactNode;
    handler: () => void;
  };
}

export function TextFieldRHF({
  name,
  rules,
  helperText,
  ...props
}: TextFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextField
          {...props}
          {...field}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default TextFieldRHF;
