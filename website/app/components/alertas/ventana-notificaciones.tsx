"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VentanaInfo } from "../ui/modals";
import { Boton } from "../ui/botones";
import { useAlertasRecientes, useMarcarAlertaLeida, useMarcarTodasLeidas } from "@hooks";
import type { AlertaResponse } from "@models";
import { ItemAlerta } from "./item-alerta";

export interface VentanaNotificacionesProps {
  open: boolean;
  handleClose: () => void;
}

export function VentanaNotificaciones({ open, handleClose }: VentanaNotificacionesProps) {
  const router = useRouter();
  // `open` como `enabled`: sin esto la ventana pediría las alertas en cada carga de
  // página aunque nadie la abra.
  const { data, isLoading, isError } = useAlertasRecientes(open);
  const marcarLeida = useMarcarAlertaLeida();
  const marcarTodasLeidas = useMarcarTodasLeidas();
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  const alertas = data?.results ?? [];
  const hayNoLeidas = alertas.some((alerta) => alerta.estado === "nuevo");

  const navegar = (destino: string) => {
    handleClose();
    router.push(destino);
  };

  const handleSeleccionar = (alerta: AlertaResponse) => {
    // Marcar y expandir son la misma acción, tal como se pidió: un solo click.
    if (alerta.estado === "nuevo") {
      marcarLeida.mutate({ id: alerta.id });
    }
    setSeleccionada((previa) => (previa === alerta.id ? null : alerta.id));
  };

  return (
    <VentanaInfo open={open} handleClose={handleClose} title="Notificaciones" icon="newNotification">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Boton content="Ver todas las notificaciones" icon="ir" onClick={() => navegar("/dashboard/alertas")} />
          {hayNoLeidas && (
            <Boton
              content="Marcar todas"
              icon="check"
              onClick={() => marcarTodasLeidas.mutate()}
              loading={marcarTodasLeidas.isPending}
            />
          )}
        </div>

        {isLoading && <p className="text-sm text-foreground-secondary">Cargando notificaciones…</p>}

        {isError && (
          <p className="text-sm text-error">No se pudieron cargar las notificaciones. Intente nuevamente.</p>
        )}

        {!isLoading && !isError && alertas.length === 0 && (
          <p className="text-sm text-foreground-secondary">No tiene notificaciones por ahora.</p>
        )}

        <div className="flex flex-col gap-3">
          {alertas.map((alerta) => (
            <ItemAlerta
              key={alerta.id}
              alerta={alerta}
              seleccionada={seleccionada === alerta.id}
              onSeleccionar={handleSeleccionar}
              onVerDispositivo={(seleccion) => navegar(`/dashboard/limnigrafos/datos/${seleccion.limnigrafo}`)}
            />
          ))}
        </div>
      </div>
    </VentanaInfo>
  );
}
