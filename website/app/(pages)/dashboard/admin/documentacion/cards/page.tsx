"use client";

import Link from "next/link";
import { Card, Paper, CardStatus, BotonVolver } from "@components";

export default function DocumentacionCardsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Cards & Paper</h1>
          <p className="text-foreground-secondary">
            Muestra de contenedores, elevaciones y tarjetas con bordes de estado de colores.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Paper Component */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-bold text-foreground">1. Paper (Fondo y Bordes Básicos)</h2>
          <p className="text-sm text-foreground-secondary">
            Un contenedor base con borde suave pero sin sombra pesada. Ideal para paneles internos o agrupaciones secundarias.
          </p>
          <Paper className="p-5 flex flex-col gap-2 items-center justify-center min-h-[120px] bg-background-muted">
            <span className="font-bold text-foreground">Contenido del Paper</span>
            <span className="text-xs text-foreground-secondary">Sin sombra de elevación</span>
          </Paper>
        </Card>

        {/* 2. Card Component */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-bold text-foreground">2. Card (Contenedores con Sombra y Hover)</h2>
          <p className="text-sm text-foreground-secondary">
            El contenedor estándar para bloques de información. Incluye sombra fina y un leve efecto de elevación al pasar el mouse.
          </p>
          <div className="flex flex-col gap-4">
            <Card className="p-5 flex flex-col gap-1 items-center justify-center min-h-[80px]">
              <span className="font-bold text-foreground">Card Estándar (Animado)</span>
              <span className="text-xs text-foreground-secondary">Tiene hover-shadow</span>
            </Card>
            <Card animated={false} className="p-5 flex flex-col gap-1 items-center justify-center min-h-[80px]">
              <span className="font-bold text-foreground">Card Fijo (Sin animación)</span>
              <span className="text-xs text-foreground-secondary">Sin animación de elevación</span>
            </Card>
          </div>
        </Card>

        {/* 3. CardStatus */}
        <Card className="flex flex-col gap-4 p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-foreground">3. CardStatus (Tarjetas con Borde de Estado)</h2>
          <p className="text-sm text-foreground-secondary">
            Tarjetas con un indicador lateral o superior de color para resaltar estados informativos o resultados de acciones.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardStatus status="success" direction="left" className="p-4 flex flex-col gap-1 justify-center min-h-[90px]">
              <span className="font-bold text-success-main text-sm">Éxito / Success</span>
              <span className="text-xs text-foreground-secondary">Borde izquierdo verde</span>
            </CardStatus>

            <CardStatus status="info" direction="left" className="p-4 flex flex-col gap-1 justify-center min-h-[90px]">
              <span className="font-bold text-info-main text-sm">Información / Info</span>
              <span className="text-xs text-foreground-secondary">Borde izquierdo azul</span>
            </CardStatus>

            <CardStatus status="warning" direction="top" className="p-4 flex flex-col gap-1 justify-center min-h-[90px]">
              <span className="font-bold text-warn-main text-sm">Advertencia / Warning</span>
              <span className="text-xs text-foreground-secondary">Borde superior naranja</span>
            </CardStatus>

            <CardStatus status="error" direction="bottom" className="p-4 flex flex-col gap-1 justify-center min-h-[90px]">
              <span className="font-bold text-error-main text-sm">Error / Error</span>
              <span className="text-xs text-foreground-secondary">Borde inferior rojo</span>
            </CardStatus>
          </div>
        </Card>
      </div>
    </div>
  );
}
