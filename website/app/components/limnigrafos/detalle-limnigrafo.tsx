"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutBase } from "../layout/layout-base";
import { SeccionAgruparInformacion } from "../ui/seccion-agrupar-informacion";
import { Alert } from "../ui/alerts";
import { InfoTooltip } from "../ui/info-tooltip";
import { Boton, BotonImportar, BotonMediciones, BotonEstadisticas, BotonEditar, BotonEliminar } from "../ui/botones";
import { EstadoConexionLimnigrafo } from "./estado-conexion-limnigrafo";
import { UltimaMedicionLimnigrafo } from "./ultima-medicion-limnigrafo";
import { RutasAccesoLimnigrafo } from "./rutas-acceso-limnigrafo";
import { VentanaEliminarLimnigrafo } from "./ventana-eliminar-limnigrafo";
import { VentanaSolicitarToken } from "./ventana-solicitar-token";
import { memoriaLegible, hmsLegibles, formatFecha, valuesToLabels, opcionesTipoComunicacion, tieneCoberturaAlertas, formatearMedicion } from "@utils";
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

  return (
    <LayoutBase
      titulo={`Limnígrafo ${limnigrafo.codigo}`}
      subtitulo={limnigrafo.ubicacion?.nombre || undefined}
      volver
      acciones={
        puedeEditar && (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Boton variant="warn" icon="llave" content="Solicitar token" onClick={() => setTokenOpen(true)} />
            <BotonEditar content="Editar" onClick={() => router.push(`/dashboard/limnigrafos/editar/${id}`)} />
            <BotonEliminar content="Eliminar" onClick={() => setEliminarOpen(true)} />
          </div>
        )
      }
    >
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
              <DatoItem label="Batería mínima" value={formatearMedicion(cfg?.bateria_min, "nivel_de_bateria")} />
              <DatoItem label="Batería máxima" value={formatearMedicion(cfg?.bateria_max, "nivel_de_bateria")} />
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
            <DatoItem label="Altura mínima del agua" value={formatearMedicion(cfg?.altura_minima_agua, "altura_agua")} />
            <DatoItem label="Altura máxima del agua" value={formatearMedicion(cfg?.altura_maxima_agua, "altura_agua")} />
            <DatoItem label="Temperatura mínima" value={formatearMedicion(cfg?.temperatura_minima, "temperatura")} />
            <DatoItem label="Temperatura máxima" value={formatearMedicion(cfg?.temperatura_maxima, "temperatura")} />
            <DatoItem label="Presión mínima" value={formatearMedicion(cfg?.presion_minima, "presion")} />
            <DatoItem label="Presión máxima" value={formatearMedicion(cfg?.presion_maxima, "presion")} />
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
    </LayoutBase>
  );
}

export default DetalleLimnigrafo;
