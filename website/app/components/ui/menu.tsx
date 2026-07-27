"use client";

import type { ReactNode } from "react";
import { cn } from "@utils";
import { IconifyIcon, type IconVariants } from "./iconify-icon";
import { BotonMenu } from "./botones";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";

export interface MenuItemConfig {
  label: string;
  action: () => void;
  icon?: IconVariants;
  className?: string;
  disabled?: boolean;
}

export interface MenuProps {
  items: MenuItemConfig[];
  ariaLabel?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  trigger?: ReactNode;
  /** "sm" (por defecto) para menús contextuales compactos, "lg" para que coincida con el tamaño del sidebar. */
  size?: "sm" | "lg";
}

export function Menu({
  items,
  ariaLabel = "Abrir menú",
  className = "",
  side = "right",
  align = "start",
  triggerClassName = "",
  trigger,
  size = "sm",
}: MenuProps) {
  const isLg = size === "lg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? <BotonMenu aria-label={ariaLabel} className={triggerClassName} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={8}
        className={cn(isLg ? "min-w-60" : "min-w-56 md:min-w-52", className)}
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.action}
            disabled={item.disabled}
            className={cn(
              isLg
                ? "h-11 cursor-pointer gap-3 rounded-shape-md px-3 text-base hover:bg-sidebar-link-hover"
                : "cursor-pointer gap-3 py-2.5 text-base md:gap-2 md:py-1.5 md:text-sm hover:bg-default-light hover:text-default-contrast",
              item.className,
            )}
          >
            {item.icon && <IconifyIcon variant={item.icon} className={isLg ? "text-3xl" : "text-xl md:text-lg"} />}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
