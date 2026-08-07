"use client";

import { CardStatus } from "../ui/cards";
import { ChipEstado } from "../ui/chip-estado";
import { Boton } from "../ui/botones";
import { ETIQUETAS_ESTADO_ALERTA, ETIQUETAS_TIPO_ALERTA, estadoTarjetaPorTipo, varianteEstadoAlerta, formatFechaHora } from "@utils";
import type { AlertaResponse } from "@models";

/**
 * Una alerta dentro de la ventana de notificaciones.
 *
 * @property {AlertaResponse} [alerta] Datos de la alerta.
 * @property {boolean} [seleccionada] Si está expandida y muestra las acciones.
 * @property {(alerta: AlertaResponse) => void} [onSeleccionar] Click en la tarjeta.
 * @property {(alerta: AlertaResponse) => void} [onVerDispositivo] Click en "Ver dispositivo".
 */
export interface ItemAlertaProps {
  alerta: AlertaResponse;
  seleccionada: boolean;
  onSeleccionar: (_alerta: AlertaResponse) => void;
  onVerDispositivo: (_alerta: AlertaResponse) => void;
}

export function ItemAlerta({ alerta, seleccionada, onSeleccionar, onVerDispositivo }: ItemAlertaProps) {
  const noLeida = alerta.estado === "nuevo";

  return (
    <CardStatus
      status={estadoTarjetaPorTipo(alerta.tipo)}
      direction="left"
      className={`w-full ${noLeida ? "bg-background-muted" : "bg-background-paper"}`}
    >
      {/* Es un botón y no un div con onClick para que llegue por teclado igual que por mouse.
          Se descartó el auto-marcado por hover del componente viejo: marcaba alertas como
          leídas por pasar el mouse de largo. */}
      <button
        type="button"
        onClick={() => onSeleccionar(alerta)}
        aria-expanded={seleccionada}
        className="flex w-full cursor-pointer flex-col gap-2 p-4 text-left outline-none"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ChipEstado
            etiqueta={ETIQUETAS_ESTADO_ALERTA[alerta.estado]}
            variante={varianteEstadoAlerta(alerta.estado)}
            size="sm"
          />
          <span className="text-xs text-foreground-secondary">
            {formatFechaHora(alerta.fecha_hora)}
          </span>
          {noLeida && (
            <span className="ml-auto size-2 shrink-0 rounded-shape-full bg-warn" aria-label="No leída" />
          )}
        </div>

        <h3 className={`text-sm ${noLeida ? "font-bold text-foreground-title" : "font-semibold text-foreground"}`}>
          {ETIQUETAS_TIPO_ALERTA[alerta.tipo] ?? alerta.tipo}
        </h3>

        <p className="text-sm leading-6 text-foreground-secondary">{alerta.descripcion}</p>

        {alerta.limnigrafo_codigo && (
          <span className="text-xs text-foreground-secondary">Limnígrafo: {alerta.limnigrafo_codigo}</span>
        )}
      </button>

      {seleccionada && alerta.limnigrafo !== null && (
        <div className="flex justify-end px-4 pb-4">
          <Boton content="Ver dispositivo" icon="mapa" onClick={() => onVerDispositivo(alerta)} />
        </div>
      )}
    </CardStatus>
  );
}
