import { SeccionAgruparInformacion } from "../ui/seccion-agrupar-informacion";
import { Chip } from "../ui/chip";
import { ChipEstadoLimnigrafo } from "./chip-estado-limnigrafo";
import { formatFechaHora, formatearMedicion } from "@utils";
import type { LimnigrafoResponse } from "@models";

function DatoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export interface UltimaMedicionLimnigrafoProps {
  limnigrafo: LimnigrafoResponse;
}

export function UltimaMedicionLimnigrafo({ limnigrafo }: UltimaMedicionLimnigrafoProps) {
  const medicion = limnigrafo.ultima_medicion;

  if (!medicion) {
    return (
      <SeccionAgruparInformacion title="Última medición">
        <div className="flex items-center gap-2">
          <Chip variant="none" className="shrink-0">Sin datos</Chip>
          <span className="text-sm text-foreground-secondary">Este limnígrafo todavía no registró ninguna medición.</span>
        </div>
      </SeccionAgruparInformacion>
    );
  }

  return (
    <SeccionAgruparInformacion title="Última medición">
      <ChipEstadoLimnigrafo
        estadoConexion={limnigrafo.estado_conexion}
        estadoMedicion={limnigrafo.estado_medicion}
        tipoComunicacion={limnigrafo.tipo_comunicacion}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DatoItem label="Fecha y hora" value={formatFechaHora(medicion.fecha_hora)} />
        <DatoItem label="Altura de agua" value={formatearMedicion(medicion.altura_agua, "altura_agua")} />
        <DatoItem label="Temperatura" value={formatearMedicion(medicion.temperatura, "temperatura")} />
        <DatoItem label="Presión" value={formatearMedicion(medicion.presion, "presion")} />
      </div>
    </SeccionAgruparInformacion>
  );
}

export default UltimaMedicionLimnigrafo;
