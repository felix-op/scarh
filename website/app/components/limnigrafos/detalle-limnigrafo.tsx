"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/cards";
import { Boton, BotonVolver, BotonImportar, BotonMediciones, BotonEstadisticas, BotonEditar, BotonEliminar } from "../ui/botones";
import { InfoTooltip } from "../ui/info-tooltip";
import { ChipEstadoLimnigrafo } from "./chip-estado-limnigrafo";
import { RutasAccesoLimnigrafo } from "./rutas-acceso-limnigrafo";
import { VentanaEliminarLimnigrafo } from "./ventana-eliminar-limnigrafo";
import { memoriaLegible, hmsLegibles, formatFecha, valuesToLabels, opcionesTipoComunicacion } from "@utils";
import type { LimnigrafoResponse } from "@models";

function DatoItem({ label, value, tooltip }: { label: string; value: ReactNode; tooltip?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-foreground-secondary">
        {label}
        {tooltip}
      </span>
      <span className="text-sm text-foreground">{value ?? "-"}</span>
    </div>
  );
}

export interface DetalleLimnigrafoProps {
  limnigrafo: LimnigrafoResponse;
  puedeEditar: boolean;
}

export function DetalleLimnigrafo({ limnigrafo, puedeEditar }: DetalleLimnigrafoProps) {
  const router = useRouter();
  const [eliminarOpen, setEliminarOpen] = useState(false);

  const cfg = limnigrafo.configuracion;
  const id = limnigrafo.id;

  const conUnidad = (valor: number | null | undefined, unidad: string): string =>
    valor != null ? `${valor}${unidad}` : "-";

  return (
    <div className="flex flex-col gap-6">
      <div className="self-start">
        <BotonVolver content="Volver" onClick={() => router.push("/dashboard/limnigrafos")} />
      </div>

      {/* Encabezado + editar/eliminar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground-title">Limnígrafo {limnigrafo.codigo}</h1>
            <ChipEstadoLimnigrafo estado={limnigrafo.estado} size="md" />
          </div>
          {limnigrafo.ubicacion?.nombre && (
            <span className="text-sm text-foreground-secondary">{limnigrafo.ubicacion.nombre}</span>
          )}
        </div>

        {puedeEditar && (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <BotonEditar content="Editar" onClick={() => router.push(`/dashboard/limnigrafos/editar/${id}`)} />
            <BotonEliminar content="Eliminar" onClick={() => setEliminarOpen(true)} />
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <BotonImportar content="Importar datos" onClick={() => router.push(`/dashboard/limnigrafos/importar/${id}`)} />
        <BotonMediciones content="Ver mediciones" onClick={() => router.push(`/dashboard/mediciones?limnigrafo=${id}`)} />
        <Boton variant="default" icon="mapa" content="Ver en el mapa" onClick={() => router.push(`/dashboard/mapa?limnigrafo=${id}`)} />
        <BotonEstadisticas content="Estadísticas" onClick={() => router.push(`/dashboard/estadisticas?limnigrafo=${id}`)} />
      </div>

      {/* Grupos de datos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold text-foreground-title">Mantenimiento</h2>
          <DatoItem label="Descripción" value={limnigrafo.descripcion || "-"} />
          <DatoItem label="Último mantenimiento" value={formatFecha(limnigrafo.ultimo_mantenimiento)} />
          <DatoItem
            label="Tiempo antes de advertencia"
            value={hmsLegibles(cfg?.tiempo_advertencia)}
            tooltip={<InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Advertencia." />}
          />
          <DatoItem
            label="Tiempo antes de fuera de rango"
            value={hmsLegibles(cfg?.tiempo_peligro)}
            tooltip={<InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado Fuera de rango." />}
          />
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold text-foreground-title">Especificaciones técnicas</h2>
          <div className="grid grid-cols-2 gap-4">
            <DatoItem label="Memoria" value={memoriaLegible(limnigrafo.memoria)} />
            <DatoItem label="Batería mínima" value={conUnidad(cfg?.bateria_min, " V")} />
            <DatoItem
              label="Radio de cobertura"
              value={limnigrafo.radio_cobertura_metros != null ? `${limnigrafo.radio_cobertura_metros} m` : "N/D"}
            />
            <DatoItem label="Altura máx. del agua" value={conUnidad(cfg?.altura_maxima_agua, " m")} />
            <DatoItem label="Altura mín. del agua" value={conUnidad(cfg?.altura_minima_agua, " m")} />
            <DatoItem label="Temperatura máx." value={conUnidad(cfg?.temperatura_maxima, " °")} />
            <DatoItem label="Temperatura mín." value={conUnidad(cfg?.temperatura_minima, " °")} />
            <DatoItem label="Presión máx." value={conUnidad(cfg?.presion_maxima, "")} />
            <DatoItem label="Presión mín." value={conUnidad(cfg?.presion_minima, "")} />
          </div>
          <DatoItem
            label="Tipo de comunicación"
            value={valuesToLabels(limnigrafo.tipo_comunicacion, opcionesTipoComunicacion)}
          />
        </Card>
      </div>

      {/* Rutas de acceso */}
      <RutasAccesoLimnigrafo limnigrafoId={id} puedeEditar={puedeEditar} />

      <VentanaEliminarLimnigrafo
        open={eliminarOpen}
        onClose={() => setEliminarOpen(false)}
        limnigrafo={limnigrafo}
        onDeleted={() => router.push("/dashboard/limnigrafos")}
      />
    </div>
  );
}

export default DetalleLimnigrafo;
