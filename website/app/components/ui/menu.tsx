"use client";

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
}

export interface MenuProps {
  items: MenuItemConfig[];
  ariaLabel?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  triggerClassName?: string;
}

export function Menu({
  items,
  ariaLabel = "Abrir menú",
  className = "",
  side = "right",
  align = "start",
  triggerClassName = "",
}: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonMenu aria-label={ariaLabel} className={triggerClassName} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} sideOffset={8} className={cn("min-w-52", className)}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={item.action}
            className={cn("cursor-pointer hover:bg-default-light hover:text-default-contrast", item.className)}
          >
            {item.icon && <IconifyIcon variant={item.icon} className="text-lg" />}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
