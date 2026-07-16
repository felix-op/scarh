"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Stepper,
  Avatar,
  Tabs,
  SegmentedControl,
  BotonVolver,
  Card,
  Boton
} from "@components";

export default function DocumentacionUXPage() {
  // Stepper State
  const [step, setStep] = useState(1);
  const steps = ["Identificación", "Configuración", "Confirmación"];

  // Tabs & Segmented Control States
  const [activeTab, setActiveTab] = useState("nuevo");
  const [activeSegment, setActiveSegment] = useState("rent");

  const tabOptions = [
    { value: "nuevo", label: "NUEVO" },
    { value: "frecuentes", label: "FRECUENTES" },
    { value: "config", label: "AJUSTES" }
  ];

  const segmentOptions = [
    { value: "rent", label: "For rent" },
    { value: "sale", label: "For sale" }
  ];

  const handleNext = () => {
    if (step < steps.length) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — UX & Navegación</h1>
          <p className="text-foreground-secondary">
            Muestra de componentes auxiliares de navegación, pestañas, controles segmentados y visualización de perfiles.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 gap-8">
        {/* 1. Tabs & Segmented Controls */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">1. Pestañas y Controles Segmentados</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Componentes de alternancia de vistas que comparten un radio de borde consistente (8px) con el resto de inputs y menús.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Segmented Control */}
            <div className="flex flex-col gap-4 p-5 border border-border rounded-lg bg-background-muted items-start">
              <span className="text-sm font-bold text-foreground-secondary">Controles Segmentados (Toggle Buttons)</span>
              <SegmentedControl
                options={segmentOptions}
                value={activeSegment}
                onChange={setActiveSegment}
              />
              <span className="text-xs text-foreground-secondary mt-2">
                Valor seleccionado: <span className="font-semibold text-primary-main">{activeSegment}</span>
              </span>
            </div>

            {/* Tabs */}
            <div className="flex flex-col gap-4 p-5 border border-border rounded-lg bg-background-muted items-start">
              <span className="text-sm font-bold text-foreground-secondary">Pestañas (Tabs)</span>
              <Tabs
                options={tabOptions}
                value={activeTab}
                onChange={setActiveTab}
              />
              <span className="text-xs text-foreground-secondary mt-2">
                Pestaña activa: <span className="font-semibold text-primary-main">{activeTab.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </Card>

        {/* 2. Stepper Showcase */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">2. Stepper (Pasos del Flujo)</h2>
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

        {/* 3. Avatar Showcase */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">3. Avatar (Identidad de Usuario)</h2>
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
