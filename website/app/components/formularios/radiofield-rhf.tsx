"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import { RadioField, RadioFieldProps } from "@/components/ui/radio-button";

export interface RadioFieldRHFProps
  extends Omit<RadioFieldProps, "errors" | "onChange" | "checked"> {
  name: string;
  rules?: RegisterOptions;
}

export function RadioFieldRHF({ name, rules, ...props }: RadioFieldRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <RadioField
          name={name}
          {...props}
          checked={field.value === props.id}
          onChange={() => field.onChange(props.id)}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default RadioFieldRHF;
