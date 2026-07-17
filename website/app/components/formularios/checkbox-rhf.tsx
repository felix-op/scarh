"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import Checkbox, { CheckboxProps } from "@/components/ui/checkbox";

export interface CheckboxRHFProps
  extends Omit<CheckboxProps, "errors" | "onChange" | "checked"> {
  name: string;
  rules?: RegisterOptions;
}

export function CheckboxRHF({ name, rules, ...props }: CheckboxRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Checkbox
          name={name}
          {...props}
          checked={field.value || false}
          onChange={field.onChange}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default CheckboxRHF;
