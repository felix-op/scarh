"use client";

import Link from "next/link";
import { Boton, BotonVolver, Card, TextField } from "@components";
import { useMensajes } from "@services";
import { useState } from "react";

export default function DocumentacionNotificacionesPage() {
  const mensajes = useMensajes();
  
  // Custom states for the testing form
  const [titulo, setTitulo] = useState("Proceso completado");
  const [contenido, setContenido] = useState("La operación se realizó con éxito.");
  const [tiempo, setTiempo] = useState<string>("5000");

  const probarSuccess = () => mensajes.success(titulo, contenido, tiempo === "false" ? false : Number(tiempo));
  const probarError = () => mensajes.error(titulo, contenido, tiempo === "false" ? false : Number(tiempo));
  const probarWarn = () => mensajes.alert(titulo, contenido, tiempo === "false" ? false : Number(tiempo));
  const probarInfo = () => mensajes.info(titulo, contenido, tiempo === "false" ? false : Number(tiempo));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Notificaciones (Toasts)</h1>
          <p className="text-foreground-secondary">
            Uso del contexto de mensajes globales (Toast) para notificar al usuario sobre eventos del sistema.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">Disparadores Rápidos</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Ejemplos de los 4 tipos de notificaciones utilizando los valores por defecto (5 segundos).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Boton 
              variant="success" 
              content="Éxito (Success)" 
              onClick={() => mensajes.success("Acción exitosa", "El elemento se guardó correctamente")} 
            />
            <Boton 
              variant="error" 
              content="Error (Error)" 
              onClick={() => mensajes.error("Ocurrió un error", "No se pudo completar la solicitud, intente nuevamente.")} 
            />
            <Boton 
              variant="warn" 
              content="Alerta (Alert)" 
              onClick={() => mensajes.alert("Atención", "Tiene campos sin completar o con información dudosa.")} 
            />
            <Boton 
              variant="primary" 
              content="Info (Info)" 
              onClick={() => mensajes.info("Nueva actualización", "Hay nuevas funciones disponibles en el sistema.")} 
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">Notificación Permanente</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Si pasas <code className="bg-background px-1.5 py-0.5 rounded text-primary">tiempo={"false"}</code>, el Toast no desaparecerá hasta que el usuario lo cierre manualmente.
          </p>
          <div className="flex flex-col gap-4">
            <Boton 
              variant="default" 
              content="Mostrar Notificación Fija" 
              onClick={() => mensajes.info("Mensaje Importante", "Esta notificación no se cerrará sola. Debes presionar la X para quitarla.", false)} 
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-foreground">Constructor Dinámico</h2>
          <p className="text-sm text-foreground-secondary -mt-4">
            Personaliza el título, contenido y tiempo de duración para probar el componente en vivo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextField 
              label="Título" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
            />
            <TextField 
              label="Contenido" 
              value={contenido} 
              onChange={(e) => setContenido(e.target.value)} 
            />
            <TextField 
              label="Tiempo (ms o 'false')" 
              value={tiempo} 
              onChange={(e) => setTiempo(e.target.value)} 
              placeholder="Ej: 5000 o false"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Boton variant="success" content="Lanzar Success" onClick={probarSuccess} />
            <Boton variant="error" content="Lanzar Error" onClick={probarError} />
            <Boton variant="warn" content="Lanzar Alert" onClick={probarWarn} />
            <Boton variant="primary" content="Lanzar Info" onClick={probarInfo} />
          </div>
        </Card>
      </div>
    </div>
  );
}
