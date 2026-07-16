"use client";

import Link from "next/link";
import {
  Boton,
  BotonGuardar,
  BotonEliminar,
  BotonEditar,
  BotonCancelar,
  BotonConfirmar,
  BotonLogin,
  BotonPassword,
  BotonFiltro,
  BotonVolver,
  BotonVerMas,
  BotonAgregar,
  BotonIcono,
  BotonIconoEditar,
  BotonIconoEliminar,
  BotonIconoPermisos,
  BotonPermisosMasivos,
  BotonImportar,
  BotonExportar,
  BotonEstadisticas,
  BotonMediciones,
  BotonUbicacion,
  BotonMenu,
  Card
} from "@components";

export default function DocumentacionBotonesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Botones</h1>
          <p className="text-foreground-secondary">
            Muestra de todos los botones semánticos y genéricos definidos en el sistema.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="flex flex-col gap-8">
        {/* 1. Botones Semánticos */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">1. Botones Semánticos del Sistema</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Botones con acciones específicas, iconos predefinidos y estilos semánticos preestablecidos.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <BotonAgregar />
            <BotonGuardar />
            <BotonEditar />
            <BotonConfirmar />
            <BotonCancelar />
            <BotonEliminar />
            <BotonVolver />
            <BotonFiltro />
            <BotonVerMas />
            <BotonLogin />
            <BotonPassword />
            <BotonPermisosMasivos />
            <BotonImportar />
            <BotonExportar />
            <BotonEstadisticas />
            <BotonMediciones />
            <BotonUbicacion />
          </div>
        </Card>

        {/* 2. Variantes del Botón Genérico (Sólidos y Outlined) */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">2. Botón Genérico (Variantes y Estados)</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Variantes sólidas y outlined para los diferentes niveles semánticos.
          </p>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-md font-bold text-foreground-secondary">Variantes Sólidas (Soft Background)</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Boton variant="primary" content="Primary" />
              <Boton variant="success" content="Success" />
              <Boton variant="error" content="Error" />
              <Boton variant="warn" content="Warning" />
              <Boton variant="default" content="Default" />
            </div>

            <h3 className="text-md font-bold text-foreground-secondary pt-2">Variantes Outlined (Borde y Texto)</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Boton variant="primary" content="Primary Outlined" outlined />
              <Boton variant="success" content="Success Outlined" outlined />
              <Boton variant="error" content="Error Outlined" outlined />
              <Boton variant="warn" content="Warning Outlined" outlined />
              <Boton variant="default" content="Default Outlined" outlined />
            </div>

            <h3 className="text-md font-bold text-foreground-secondary pt-2">Estados Especiales</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Boton variant="primary" content="Cargando" loading />
              <Boton variant="success" content="Deshabilitado" disabled />
              <Boton variant="primary" icon="guardar" content="Con Icono Izquierda" />
            </div>
          </div>
        </Card>

        {/* 3. Botones de Icono y Menú */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">3. Botones de Icono y Menú Contextual</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Botones compactos para acciones rápidas o disparadores de menús flotantes.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-secondary font-bold">BotonIcono genérico</span>
              <div className="flex gap-3">
                <BotonIcono icon="agregar" />
                <BotonIcono icon="eliminar" />
                <BotonIcono icon="editar" />
                <BotonIcono icon="volver" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-secondary font-bold">BotonIconoEditar (éxito)</span>
              <div>
                <BotonIconoEditar />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-secondary font-bold">BotonIconoEliminar (error)</span>
              <div>
                <BotonIconoEliminar />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-secondary font-bold">BotonIconoPermisos (advertencia)</span>
              <div>
                <BotonIconoPermisos />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-foreground-secondary font-bold">BotonMenu (3 puntos)</span>
              <div>
                <BotonMenu />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
