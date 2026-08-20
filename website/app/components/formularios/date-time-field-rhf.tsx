"use client";

import { Controller, type RegisterOptions, useFormContext } from "react-hook-form";
import { DateTimeField, type DateTimeFieldProps } from "../ui/date-time-field";

/** Campo `DateTimeField` conectado al contexto de React Hook Form. */
export interface DateTimeFieldRHFProps extends Omit<DateTimeFieldProps, "errors" | "onChange" | "value"> {
  name: string;
  rules?: RegisterOptions;
}

export function DateTimeFieldRHF({ name, rules, ...props }: DateTimeFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errors = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <DateTimeField
          {...props}
          name={name}
          value={field.value || undefined}
          onChange={field.onChange}
          errors={errors}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}
