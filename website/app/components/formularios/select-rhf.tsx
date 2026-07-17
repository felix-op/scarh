"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import Select, { SelectProps } from "@/components/ui/select";

export interface SelectRHFProps
  extends Omit<SelectProps, "errors" | "onChange" | "value"> {
  name: string;
  rules?: RegisterOptions;
}

export function SelectRHF({ name, rules, ...props }: SelectRHFProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];
  const errorMessages = error ? [String(error.message)] : [];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Select
          name={name}
          {...props}
          value={field.value || ""}
          onChange={field.onChange}
          errors={errorMessages}
          disabled={props.disabled || formState.isSubmitting}
        />
      )}
    />
  );
}

export default SelectRHF;
