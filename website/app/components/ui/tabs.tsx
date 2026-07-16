"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";

export interface TabOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ options, value, onChange, className = "" }: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeIndex = options.findIndex((opt) => opt.value === value);
    if (activeIndex === -1) return;

    const activeTabElement = containerRef.current.children[activeIndex] as HTMLElement;
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [value, options]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [value, options]);

  return (
    <div className={`flex border-b border-border w-full ${className}`}>
      <div className="flex gap-2 relative" ref={containerRef}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-300 cursor-pointer outline-none select-none rounded-t-shape-md
                ${
                  isActive
                    ? "border-transparent text-primary bg-primary-light/10"
                    : "border-transparent text-foreground-secondary hover:text-foreground hover:bg-background-default"
                }
              `.trim().replace(/\s+/g, " ")}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
        {/* Animated Line */}
        <div
          className="absolute bottom-[-1px] h-[2px] bg-primary transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
      </div>
    </div>
  );
}

export default Tabs;
