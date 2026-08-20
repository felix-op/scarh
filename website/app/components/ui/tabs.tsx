"use client";

import type { ReactNode } from "react";

export interface TabOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (_value: string) => void;
  className?: string;
}

export function Tabs({ options, value, onChange, className = "" }: TabsProps) {
  return (
    <div className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-shape-full bg-background-paper p-1 shadow-card ${className}`}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-shape-full px-4 py-2 text-sm font-medium outline-none transition-colors ${
              isActive
                ? "bg-primary text-primary-contrast shadow-sm"
                : "text-foreground-secondary hover:bg-hover hover:text-foreground"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
