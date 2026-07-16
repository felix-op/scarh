"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boton,
  BotonVolver,
  Card,
  VentanaConfirmar,
  VentanaInfo,
  VentanaFormulario,
  TextField
} from "@components";
import { VentanaEliminar } from "@/components/ventanas/ventana-eliminar";

interface MockUsuario {
  id: number;
  nombre_usuario: string;
  rol: string;
}

export default function DocumentacionModalsPage() {
  // Confirm modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<"info" | "success" | "warn" | "error" | "cierre">("info");

  // Drawer Info state
  const [infoOpen, setInfoOpen] = useState(false);

  // Form Sheet state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const mockUsuario: MockUsuario = { id: 101, nombre_usuario: "Juan Pérez", rol: "Editor" };

  const triggerConfirm = (variant: typeof confirmVariant) => {
    setConfirmVariant(variant);
    setConfirmOpen(true);
  };

  const handleFormAction = async (formData: FormData) => {
    setFormLoading(true);
    // Simulate server action latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormLoading(false);
    setFormOpen(false);
    alert(`Formulario enviado con éxito. Nombre: ${formData.get("userName")}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Ventanas y Modales</h1>
          <p className="text-foreground-secondary">
            Visualización interactiva y disparadores para diálogos, sheets y drawers del sistema.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. VentanaConfirmar (Dialogs) */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">1. VentanaConfirmar (Diálogos de Confirmación)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Modales de confirmación con diferentes variantes semánticas, colores y alineación centrada.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Boton variant="primary" content="Confirmar Info" onClick={() => triggerConfirm("info")} />
            <Boton variant="success" content="Confirmar Éxito" onClick={() => triggerConfirm("success")} />
            <Boton variant="warn" content="Confirmar Advertencia" onClick={() => triggerConfirm("warn")} />
            <Boton variant="error" content="Confirmar Error" onClick={() => triggerConfirm("error")} />
            <Boton variant="default" content="Confirmar Cierre" onClick={() => triggerConfirm("cierre")} className="col-span-2" />
          </div>
        </Card>

        {/* 2. Ventanas Laterales (Drawer e Info) */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">2. VentanaInfo (Drawer Lateral)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Paneles deslizantes por la derecha pensados para visualizar información extendida o perfiles de usuario.
          </p>
          <Boton variant="primary" content="Abrir Panel de Información" onClick={() => setInfoOpen(true)} />
        </Card>

        {/* 3. VentanaFormulario (Sheet) */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">3. VentanaFormulario (Ficha/Formulario Lateral)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Sheet deslizante lateral con un formulario integrado y pie de acción (cancelar / guardar) acoplado a Server Actions.
          </p>
          <Boton variant="success" content="Abrir Formulario de Creación" onClick={() => setFormOpen(true)} />
        </Card>

        {/* 4. VentanaEliminar (Generic) */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">4. VentanaEliminar (Eliminación Genérica)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Modal estilizado y pre-configurado para confirmaciones de borrado, admitiendo objetos y formateadores genéricos.
          </p>
          <Boton variant="error" content="Eliminar Usuario (Mock)" onClick={() => setDeleteOpen(true)} />
        </Card>
      </div>

      {/* RENDER DE MODALES */}

      {/* Confirmar Dialog */}
      <BotonConfirmarRender
        open={confirmOpen}
        variant={confirmVariant}
        onClose={() => setConfirmOpen(false)}
      />

      {/* Drawer Info */}
      <VentanaInfo
        open={infoOpen}
        handleClose={() => setInfoOpen(false)}
        title="Perfil de Usuario"
        icon="user1"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary font-bold">NOMBRE COMPLETO</span>
            <span className="text-sm text-foreground">Juan Pérez Gómez</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary font-bold">CORREO ELECTRÓNICO</span>
            <span className="text-sm text-foreground">juan.perez@example.com</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary font-bold">ROL ASIGNADO</span>
            <span className="text-sm text-foreground">Editor de Contenido</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-foreground-secondary font-bold">ÚLTIMO ACCESO</span>
            <span className="text-sm text-foreground">16 de Julio de 2026, 08:30 AM</span>
          </div>
        </div>
      </VentanaInfo>

      {/* Form Sheet */}
      <VentanaFormulario
        open={formOpen}
        handleClose={() => setFormOpen(false)}
        title="Agregar Nuevo Colaborador"
        icon="agregar"
        action={handleFormAction}
        isLoading={formLoading}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="Nombre Completo"
            name="userName"
            required
            placeholder="Ej: Ana María"
          />
          <TextField
            label="Correo Electrónico"
            name="userEmail"
            type="email"
            required
            placeholder="ana@example.com"
          />
        </div>
      </VentanaFormulario>

      {/* Delete Modal */}
      <VentanaEliminar<MockUsuario>
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          alert("Usuario eliminado correctamente.");
        }}
        elemento={mockUsuario}
        accessorKey="nombre_usuario"
        title="Eliminar Usuario"
      />
    </div>
  );
}

// Auxiliar rendering to prevent code bloat in page component
function BotonConfirmarRender({
  open,
  variant,
  onClose
}: {
  open: boolean;
  variant: "info" | "success" | "warn" | "error" | "cierre";
  onClose: () => void;
}) {
  const descriptions = {
    info: "Esta es una ventana de información general con opción a confirmación.",
    success: "La operación se completó exitosamente y se guardaron los cambios.",
    warn: "Esta acción tiene implicaciones importantes. ¿Desea proceder?",
    error: "Ha ocurrido un inconveniente crítico. ¿Desea reintentar la acción?",
    cierre: "¿Está seguro que desea cerrar el formulario? Perderá todos sus cambios realizados."
  };

  const titles = {
    info: "Información de Proceso",
    success: "Proceso Exitoso",
    warn: "Acción Delicada",
    error: "Error del Sistema",
    cierre: "Cerrar Formulario"
  };

  return (
    <VentanaConfirmar
      open={open}
      onClose={onClose}
      onConfirm={() => {
        alert("Acción confirmada correctamente.");
        onClose();
      }}
      variant={variant}
      title={titles[variant]}
      description={descriptions[variant]}
    />
  );
}
