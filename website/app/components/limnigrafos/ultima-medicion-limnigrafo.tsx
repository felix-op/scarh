import { SeccionAgruparInformacion } from "../ui/seccion-agrupar-informacion";
import { Chip } from "../ui/chip";
import { ChipEstadoMedicion } from "./chip-estado-limnigrafo";
import { formatFechaHora } from "@utils";
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
          <Chip variant="none">Sin datos</Chip>
          <span className="text-sm text-foreground-secondary">Este limnígrafo todavía no registró ninguna medición.</span>
        </div>
      </SeccionAgruparInformacion>
    );
  }

  const conUnidad = (valor: number | null | undefined, unidad: string): string =>
    valor != null ? `${valor}${unidad}` : "-";

  return (
    <SeccionAgruparInformacion title="Última medición">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">Estado del lote</span>
        <ChipEstadoMedicion estado={limnigrafo.estado_medicion} size="sm" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DatoItem label="Fecha y hora" value={formatFechaHora(medicion.fecha_hora)} />
        <DatoItem label="Altura de agua" value={conUnidad(medicion.altura_agua, " m")} />
        <DatoItem label="Temperatura" value={conUnidad(medicion.temperatura, " °C")} />
        <DatoItem label="Presión" value={conUnidad(medicion.presion, " hPa")} />
      </div>
    </SeccionAgruparInformacion>
  );
}

export default UltimaMedicionLimnigrafo;
