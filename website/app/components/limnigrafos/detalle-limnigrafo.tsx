"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { SeccionAgruparInformacion } from "../ui/seccion-agrupar-informacion";
import { Alert } from "../ui/alerts";
import { InfoTooltip } from "../ui/info-tooltip";
import { Boton, BotonVolver, BotonImportar, BotonMediciones, BotonEstadisticas, BotonEditar, BotonEliminar } from "../ui/botones";
import { EstadoConexionLimnigrafo } from "./estado-conexion-limnigrafo";
import { UltimaMedicionLimnigrafo } from "./ultima-medicion-limnigrafo";
import { RutasAccesoLimnigrafo } from "./rutas-acceso-limnigrafo";
import { VentanaEliminarLimnigrafo } from "./ventana-eliminar-limnigrafo";
import { VentanaSolicitarToken } from "./ventana-solicitar-token";
import { memoriaLegible, hmsLegibles, formatFecha, valuesToLabels, opcionesTipoComunicacion, tieneCoberturaAlertas } from "@utils";
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
  const [tokenOpen, setTokenOpen] = useState(false);

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
          <h1 className="text-2xl font-bold text-foreground-title">Limnígrafo {limnigrafo.codigo}</h1>
          {limnigrafo.ubicacion?.nombre && (
            <span className="text-sm text-foreground-secondary">{limnigrafo.ubicacion.nombre}</span>
          )}
        </div>

        {puedeEditar && (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Boton variant="warn" icon="llave" content="Solicitar token" onClick={() => setTokenOpen(true)} />
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

      {/* Grupos de datos: misma división que la página de editar (Datos del limnígrafo / Configuración de alertas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SeccionAgruparInformacion title="Datos del limnígrafo">
            <DatoItem label="Descripción" value={limnigrafo.descripcion || "-"} />
            <DatoItem label="Último mantenimiento" value={formatFecha(limnigrafo.ultimo_mantenimiento)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatoItem label="Memoria" value={memoriaLegible(limnigrafo.memoria)} />
              <DatoItem
                label="Radio de cobertura estimada"
                value={limnigrafo.radio_cobertura_metros != null ? `${limnigrafo.radio_cobertura_metros} m` : "N/D"}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatoItem label="Batería mínima" value={conUnidad(cfg?.bateria_min, " V")} />
              <DatoItem label="Batería máxima" value={conUnidad(cfg?.bateria_max, " V")} />
            </div>
            <div className="pt-2 border-t border-border">
              <EstadoConexionLimnigrafo limnigrafo={limnigrafo} />
            </div>
          </SeccionAgruparInformacion>

          <UltimaMedicionLimnigrafo limnigrafo={limnigrafo} />
        </div>

        <SeccionAgruparInformacion title="Configuración de alertas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatoItem
              label="Tiempo máximo antes de Advertencia"
              value={hmsLegibles(cfg?.tiempo_advertencia)}
              tooltip={<InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Advertencia." />}
            />
            <DatoItem
              label="Tiempo máximo antes de Peligro"
              value={hmsLegibles(cfg?.tiempo_peligro)}
              tooltip={<InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Peligro." />}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DatoItem label="Altura mínima del agua" value={conUnidad(cfg?.altura_minima_agua, " m")} />
            <DatoItem label="Altura máxima del agua" value={conUnidad(cfg?.altura_maxima_agua, " m")} />
            <DatoItem label="Temperatura mínima" value={conUnidad(cfg?.temperatura_minima, " °")} />
            <DatoItem label="Temperatura máxima" value={conUnidad(cfg?.temperatura_maxima, " °")} />
            <DatoItem label="Presión mínima" value={conUnidad(cfg?.presion_minima, "")} />
            <DatoItem label="Presión máxima" value={conUnidad(cfg?.presion_maxima, "")} />
          </div>
          <DatoItem
            label="Tipo de comunicación"
            value={valuesToLabels(limnigrafo.tipo_comunicacion, opcionesTipoComunicacion)}
          />
          {!tieneCoberturaAlertas(limnigrafo.tipo_comunicacion) && (
            <Alert variant="alerta" title="Sin cobertura para alertas">
              Este limnígrafo no es tenido en cuenta para el sistema de alertas porque ninguno de los tipos de
              comunicación seleccionados es compatible (2G, 3G, 4G, 5G, SMS o SMTP).
            </Alert>
          )}
        </SeccionAgruparInformacion>
      </div>

      {/* Rutas de acceso */}
      <RutasAccesoLimnigrafo limnigrafoId={id} puedeEditar={puedeEditar} />

      <VentanaEliminarLimnigrafo
        open={eliminarOpen}
        onClose={() => setEliminarOpen(false)}
        limnigrafo={limnigrafo}
        onDeleted={() => router.push("/dashboard/limnigrafos")}
      />

      <VentanaSolicitarToken open={tokenOpen} onClose={() => setTokenOpen(false)} limnigrafo={limnigrafo} />
    </div>
  );
}

export default DetalleLimnigrafo;
