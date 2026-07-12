"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../shadcn/sheet";

export interface VentanaProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Ventana({
  open,
  handleClose,
  title,
  children,
  className = "",
}: VentanaProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className={`rounded-shape-lg border-border bg-background-paper p-6 shadow-card ${className}`.trim()}>
        {title && (
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-foreground-title">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="text-foreground">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export interface VentanaLateralProps extends VentanaProps {
  direction?: "right" | "left";
}

export function VentanaLateral({
  open,
  handleClose,
  title,
  children,
  className = "",
  direction = "right",
}: VentanaLateralProps) {
  // Mapear direction de nuestra prop al side de Shadcn
  const side = direction;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent
        side={side}
        className={`border-border bg-background-paper p-6 shadow-card ${className}`.trim()}
      >
        {title && (
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-semibold text-foreground-title">{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="text-foreground h-full overflow-y-auto custom-scroll pr-1">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
export default Ventana;
