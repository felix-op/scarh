"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useCerrarConAtras } from "@hooks";
import {
  Dialog,
  DialogContent,
} from "../shadcn/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../shadcn/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "../shadcn/drawer";
import { Boton, BotonGuardar, BotonCancelar } from "./botones";
import { IconifyIcon, IconVariants } from "./iconify-icon";

// 1. Ventana Base (Dialog)
export interface VentanaProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Ventana({
  open,
  handleClose,
  title,
  children,
  className = "",
}: VentanaProps) {
  useCerrarConAtras(open, handleClose);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className={`rounded-shape-lg border-border bg-background-paper p-6 shadow-card ${className}`.trim()}>
        {title && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground-title">{title}</h2>
          </div>
        )}
        <div className="text-foreground">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

// 2. Ventana Confirmar
export interface VentanaConfirmarProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  variant?: "info" | "error" | "warn" | "success" | "eliminar" | "cierre";
  hasCancel?: boolean;
  icon?: IconVariants;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const variantConfig = {
  info: {
    color: "text-primary border-primary bg-primary-light/10",
    btnVariant: "primary" as const,
    defaultIcon: "info" as IconVariants,
  },
  success: {
    color: "text-success border-success bg-success-light/10",
    btnVariant: "success" as const,
    defaultIcon: "check" as IconVariants,
  },
  warn: {
    color: "text-warn border-warn bg-warn-light/10",
    btnVariant: "warn" as const,
    defaultIcon: "alerta" as IconVariants,
  },
  error: {
    color: "text-error border-error bg-error-light/10",
    btnVariant: "error" as const,
    defaultIcon: "eliminar" as IconVariants,
  },
  eliminar: {
    color: "text-error border-error bg-error-light/10",
    btnVariant: "error" as const,
    defaultIcon: "eliminar" as IconVariants,
  },
  cierre: {
    color: "text-warn border-warn bg-warn-light/10",
    btnVariant: "warn" as const,
    defaultIcon: "alerta" as IconVariants,
  },
};

export function VentanaConfirmar({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  variant = "info",
  hasCancel = true,
  icon,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
}: VentanaConfirmarProps) {
  const config = variantConfig[variant] || variantConfig.info;
  const activeIcon = icon || config.defaultIcon;

  useCerrarConAtras(open, () => !isLoading && onClose());

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isLoading && onClose()}>
      <DialogContent className="rounded-shape-lg border-border bg-background-paper p-6 max-w-sm md:max-w-lg shadow-card flex flex-col items-center text-center">
        {/* Icono Circular */}
        <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center mb-4 ${config.color}`}>
          <IconifyIcon variant={activeIcon} className="text-2xl" />
        </div>

        {/* Título */}
        {title && <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>}

        {/* Descripción / Contenido */}
        {(description || children) && (
          <div className="text-sm text-foreground-secondary mb-6 w-full">
            {children || description}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3 justify-center w-full">
          {hasCancel && (
            <Boton
              variant="default"
              content={cancelText}
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            />
          )}
          <Boton
            variant={config.btnVariant}
            content={confirmText}
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 3. Ventana Info (Drawer por la Derecha re-mapeado a Drawer)
export interface VentanaInfoProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  icon?: IconVariants;
  children: ReactNode;
  className?: string;
}

export function VentanaInfo({
  open,
  handleClose,
  title,
  icon,
  children,
  className = "",
}: VentanaInfoProps) {
  useCerrarConAtras(open, handleClose);

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && handleClose()} direction="right">
      <DrawerContent className={`h-full border-l border-border bg-background-paper shadow-card ${className}`.trim()}>
        <div className="flex flex-col h-full w-full">
          <div className="flex justify-between items-center p-5 shrink-0">
            <div className="flex items-center gap-2">
              {icon && <IconifyIcon variant={icon} className="text-3xl text-primary" />}
              <DrawerTitle className="text-2xl text-foreground-title font-bold">
                {title}
              </DrawerTitle>
            </div>
            <button
              type="button"
              aria-label="Cerrar"
              className="flex bg-background-default hover:bg-hover rounded-full cursor-pointer text-foreground hover:text-error p-2 outline-none border-none transition-colors"
              onClick={handleClose}
            >
              <IconifyIcon variant="cancelar" className="text-xl" />
            </button>
          </div>

          <hr className="h-px bg-border border-0 m-0 shrink-0" />

          <div className="p-5 grow overflow-y-auto custom-scroll text-foreground">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// 4. Ventana Formulario (Sheet por la Derecha con soporte de Server Actions)
export interface VentanaFormularioProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  icon?: IconVariants;
  action?: string | ((formData: FormData) => void | Promise<void>);
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  askForConfirmation?: boolean;
}

export function VentanaFormulario({
  open,
  handleClose,
  title,
  icon,
  action,
  onSubmit,
  children,
  className = "",
  isLoading = false,
  submitText = "Guardar",
  cancelText = "Cancelar",
  askForConfirmation = true,
}: VentanaFormularioProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setIsDirty(false);
      setShowConfirm(false);
    }
  }, [open]);

  const handleAttemptClose = () => {
    if (askForConfirmation && isDirty) {
      setShowConfirm(true);
    } else {
      handleClose();
    }
  };

  useCerrarConAtras(open, handleAttemptClose);

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleAttemptClose()}>
        <SheetContent
          side="right"
          hideCloseButton={true}
          className={`border-border bg-background-paper p-0 shadow-card h-full ${className}`.trim()}
        >
          <form
            action={action}
            onSubmit={onSubmit}
            onChange={() => setIsDirty(true)}
            className="flex flex-col h-full w-full"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 shrink-0">
              <div className="flex items-center gap-2">
                {icon && <IconifyIcon variant={icon} className="text-3xl text-primary" />}
                <SheetTitle className="text-2xl text-foreground-title font-bold">
                  {title}
                </SheetTitle>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                className="flex bg-background-default hover:bg-hover rounded-full cursor-pointer text-foreground hover:text-error p-2 outline-none border-none transition-colors"
                onClick={handleAttemptClose}
              >
                <IconifyIcon variant="cancelar" className="text-xl" />
              </button>
            </div>

            <hr className="h-px bg-border border-0 m-0 shrink-0" />

            {/* Form Content */}
            <div className="p-5 grow overflow-y-auto custom-scroll text-foreground">
              {children}
            </div>

            <hr className="h-px bg-border border-0 m-0 shrink-0" />

            {/* Footer */}
            <div className="flex justify-between items-center p-5 shrink-0 gap-4">
              <BotonCancelar
                content={cancelText}
                onClick={handleAttemptClose}
                disabled={isLoading}
                className="flex-1"
              />
              <BotonGuardar
                type="submit"
                content={submitText}
                loading={isLoading}
                disabled={isLoading}
                className="flex-1"
              />
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <VentanaConfirmar
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          handleClose();
        }}
        variant="cierre"
        title="¿Descartar cambios?"
        description="Tienes cambios sin guardar. Si cierras ahora, se perderán."
        confirmText="Sí, descartar"
        cancelText="Volver al formulario"
      />
    </>
  );
}

export default Ventana;
