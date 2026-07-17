"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import Switch, { SwitchProps } from "@/components/ui/switch";

export interface SwitchRHFProps
  extends Omit<SwitchProps, "errors" | "onChange" | "checked"> {
  name: string;
  rules?: RegisterOptions;
}

export function SwitchRHF({ name, rules, ...props }: SwitchRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Switch
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

export default SwitchRHF;
