"use client";

import Link from "next/link";
import { useState } from "react";
import { Carrusel, Select } from "../ui";
import { Card, CardStatus } from "../ui/cards";
import { IconifyIcon } from "../ui/iconify-icon";
import { ChipEstadoLimnigrafo } from "../limnigrafos/chip-estado-limnigrafo";
import {
  evaluarEstadoLimnigrafo,
  formatFechaHora,
  formatearMedicion,
  opcionesEstadoLimnigrafoUnificado,
  ordenarPorCriticidad,
  type EstadoLimnigrafoClave,
} from "@utils";
import type { DashboardLimnigrafo } from "@models";

/**
 * Grilla de dispositivos: el contenido principal del tablero.
 *
 * Se ordena por criticidad —lo que necesita atención primero— y el encabezado lleva
 * la cuenta, para no tener que recorrer las tarjetas para saber si hay algo mal. A
 * igual criticidad manda el orden alfabético, así el refresco automático no
 * reacomoda la grilla salvo que el estado de un dispositivo haya cambiado.
 *
 * Cada tarjeta enlaza a la ficha del limnígrafo, que es adonde se va cuando algo
 * llama la atención acá.
 *
 * @property {DashboardLimnigrafo[]} limnigrafos Estado actual de cada dispositivo.
 */
export interface GrillaLimnigrafosProps {
  limnigrafos: DashboardLimnigrafo[];
  className?: string;
}

type FiltroEstado = "todos" | EstadoLimnigrafoClave;

export function GrillaLimnigrafos({ limnigrafos, className = "" }: GrillaLimnigrafosProps) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const ordenados = ordenarPorCriticidad(limnigrafos, (limnigrafo) => ({
    codigo: limnigrafo.codigo,
    estadoConexion: limnigrafo.estado_conexion,
    estadoMedicion: limnigrafo.estado_medicion,
    tipoComunicacion: limnigrafo.tipo_de_comunicacion,
  }));

  const conProblemas = ordenados.filter(
    (limnigrafo) =>
      evaluarEstadoLimnigrafo({
        estadoConexion: limnigrafo.estado_conexion,
        estadoMedicion: limnigrafo.estado_medicion,
        tipoComunicacion: limnigrafo.tipo_de_comunicacion,
      }).requiereAtencion
  ).length;
  const filtrados = ordenados.filter((limnigrafo) => {
    if (filtroEstado === "todos") return true;
    return evaluarEstadoLimnigrafo({
      estadoConexion: limnigrafo.estado_conexion,
      estadoMedicion: limnigrafo.estado_medicion,
      tipoComunicacion: limnigrafo.tipo_de_comunicacion,
    }).clave === filtroEstado;
  });

  if (limnigrafos.length === 0) {
    return (
      <Card className={`flex flex-col items-center gap-2 p-10 text-center ${className}`.trim()}>
        <IconifyIcon variant="chip" className="text-3xl text-foreground-disabled" />
        <p className="text-sm text-foreground-secondary">
          Todavía no hay limnígrafos dados de alta.
        </p>
      </Card>
    );
  }

  return (
    <section className={`flex min-h-0 flex-col gap-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="mb-0 text-lg font-semibold text-foreground-title">{ordenados.length} dispositivos</h2>
        <div className="w-full sm:w-64">
          <Select
            label="Estado"
            name="estado-dispositivos-dashboard"
            options={opcionesEstadoLimnigrafoUnificado}
            value={filtroEstado}
            onChange={(valor) => setFiltroEstado(valor as FiltroEstado)}
            labelPosition="left"
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-shape-md border border-dashed border-border p-6 text-sm text-foreground-secondary">
          No hay dispositivos con este estado.
        </div>
      ) : (
        <Carrusel
          elementosPorPagina={4}
          ariaLabel="Dispositivos"
          className="flex-1"
          controlesFlotantes
          classNamePagina="grid h-full grid-cols-1 grid-rows-4 content-start items-center gap-3 sm:grid-cols-2 sm:grid-rows-2"
        >
          {filtrados.map((limnigrafo) => (
            <TarjetaLimnigrafo key={limnigrafo.id} limnigrafo={limnigrafo} />
          ))}
        </Carrusel>
      )}

      <span className="text-center text-sm font-semibold text-foreground-title">
        {conProblemas === 0 ? (
          "Todos los dispositivos están en orden"
        ) : (
          <>
            <span className="text-warn">{conProblemas}</span>{" "}
            {conProblemas === 1 ? "requiere" : "requieren"} atención
          </>
        )}
      </span>
    </section>
  );
}

function TarjetaLimnigrafo({ limnigrafo }: { limnigrafo: DashboardLimnigrafo }) {
  const { ultima_medicion: ultima } = limnigrafo;
  const estado = evaluarEstadoLimnigrafo({
    estadoConexion: limnigrafo.estado_conexion,
    estadoMedicion: limnigrafo.estado_medicion,
    tipoComunicacion: limnigrafo.tipo_de_comunicacion,
  });
  const estiloEstado = {
    success: "success",
    warn: "warning",
    error: "error",
    neutral: "info",
  } as const;

  return (
    <Link
      href={`/dashboard/limnigrafos/datos/${limnigrafo.id}`}
      className="no-underline outline-none"
    >
      <CardStatus status={estiloEstado[estado.variante]} direction="left" className="flex w-full flex-col gap-2 p-3 transition-colors hover:bg-hover">
        {/* El estado va arriba del código: es lo que se barre con la vista al
            recorrer la grilla, y el nombre sólo hace falta cuando algo llama la
            atención. */}
        <div className="flex items-start justify-between gap-2">
          <ChipEstadoLimnigrafo
            estadoConexion={limnigrafo.estado_conexion}
            estadoMedicion={limnigrafo.estado_medicion}
            tipoComunicacion={limnigrafo.tipo_de_comunicacion}
            size="sm"
          />
          <IconifyIcon variant="rightArrow" className="text-lg text-foreground-disabled" />
        </div>

        <span className="font-semibold text-foreground-title">{limnigrafo.codigo}</span>

        {ultima ? (
          <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <Dato etiqueta="Nivel" valor={formatearMedicion(ultima.altura_agua, "altura_agua")} />
            <Dato
              etiqueta="Batería"
              valor={formatearMedicion(ultima.nivel_de_bateria, "nivel_de_bateria")}
            />
            <span className="w-full text-xs text-foreground-secondary">
              Última medición: {formatFechaHora(ultima.fecha_hora)}
            </span>
          </dl>
        ) : (
          <p className="text-sm text-foreground-disabled">Sin mediciones registradas.</p>
        )}
      </CardStatus>
    </Link>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[11px] uppercase tracking-wide text-foreground-secondary">{etiqueta}</dt>
      <dd className="text-base font-semibold tabular-nums text-foreground">{valor}</dd>
    </div>
  );
}
