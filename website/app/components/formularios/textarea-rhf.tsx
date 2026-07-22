"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import TextArea, { TextAreaProps } from "@/components/ui/textarea";

export interface TextAreaRHFProps
  extends Omit<TextAreaProps, "errors" | "onChange" | "value" | "defaultValue"> {
  name: string;
  rules?: RegisterOptions;
}

export function TextAreaRHF({ name, rules, ...props }: TextAreaRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TextArea
          {...props}
          {...field}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default TextAreaRHF;
