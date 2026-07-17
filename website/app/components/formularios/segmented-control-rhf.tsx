"use client";

import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import {
  SegmentedControl,
  SegmentedControlProps,
} from "@/components/ui/segmented-control";

export interface SegmentedControlRHFProps
  extends Omit<SegmentedControlProps, "onChange" | "value"> {
  name: string;
  rules?: RegisterOptions;
}

export function SegmentedControlRHF({
  name,
  rules,
  ...props
}: SegmentedControlRHFProps) {
  const { control, formState } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <SegmentedControl
          {...props}
          value={field.value || ""}
          onChange={field.onChange}
        />
      )}
    />
  );
}

export default SegmentedControlRHF;
