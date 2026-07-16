"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Stepper,
  Avatar,
  BotonVolver,
  Card,
  Boton
} from "@components";

export default function DocumentacionUXPage() {
  // Stepper State
  const [step, setStep] = useState(1);
  const steps = ["Identificación", "Configuración", "Confirmación"];

  const handleNext = () => {
    if (step < steps.length) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — UX & Navegación</h1>
          <p className="text-foreground-secondary">
            Muestra de componentes auxiliares de navegación (Stepper) y visualización de perfiles (Avatar).
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 gap-8">
        {/* 1. Stepper Showcase */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">1. Stepper (Pasos del Flujo)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Componente para guiar al usuario a través de flujos de múltiples pasos.
          </p>
          
          <div className="flex flex-col gap-8 py-4 border border-border rounded-lg bg-background-muted items-center justify-center p-6">
            <Stepper currentStep={step} steps={steps} />
            
            <div className="flex gap-4">
              <Boton variant="default" content="Anterior" onClick={handlePrev} disabled={step === 1} />
              <Boton variant="primary" content="Siguiente" onClick={handleNext} disabled={step === steps.length} />
            </div>
          </div>
        </Card>

        {/* 2. Avatar Showcase */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">2. Avatar (Identidad de Usuario)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Muestra las iniciales del usuario o su imagen de perfil con diferentes tamaños disponibles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar por Iniciales */}
            <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-muted items-center">
              <span className="text-sm font-bold text-foreground-secondary">Basado en Iniciales</span>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Avatar nombre="Félix" apellido="Pérez" size="sm" />
                  <span className="text-xs text-foreground-secondary">sm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar nombre="Félix" apellido="Pérez" size="md" />
                  <span className="text-xs text-foreground-secondary">md</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar nombre="Félix" apellido="Pérez" size="lg" />
                  <span className="text-xs text-foreground-secondary">lg</span>
                </div>
              </div>
            </div>

            {/* Avatar con Imagen */}
            <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-muted items-center">
              <span className="text-sm font-bold text-foreground-secondary">Con Imagen de Perfil</span>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Avatar url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" size="sm" />
                  <span className="text-xs text-foreground-secondary">sm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" size="md" />
                  <span className="text-xs text-foreground-secondary">md</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" size="lg" />
                  <span className="text-xs text-foreground-secondary">lg</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
