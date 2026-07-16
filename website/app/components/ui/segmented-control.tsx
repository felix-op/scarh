"use client";

import { ReactNode } from "react";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div
      className={`
        inline-flex items-stretch p-1 bg-background-default border border-input-border rounded-shape-md
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex items-center justify-center gap-2 py-1.5 px-4 text-sm font-medium transition-all cursor-pointer outline-none select-none rounded-shape-md border
              ${
                isActive
                  ? "bg-primary-light text-primary border-primary shadow-sm"
                  : "bg-transparent text-foreground-secondary border-transparent hover:text-foreground"
              }
            `.trim().replace(/\s+/g, " ")}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
