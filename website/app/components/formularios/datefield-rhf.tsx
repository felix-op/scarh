"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import DateField, { DateFieldProps } from "@/components/ui/datefield";

export interface DateFieldRHFProps
  extends Omit<DateFieldProps, "errors" | "onChange" | "value"> {
  name: string;
  rules?: RegisterOptions;
}

export function DateFieldRHF({ name, rules, ...props }: DateFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <DateField
          name={name}
          {...props}
          value={field.value || undefined}
          onChange={field.onChange}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default DateFieldRHF;
