"use client";

import { format } from "date-fns";
import { Select, DateField, Chip, Boton, Card } from "@components";
import { opcionesFuenteMedicion, opcionesVentanaTiempo, obtenerFechasVentana } from "@utils";

export interface MedicionesFiltrosState {
  limnigrafo: string;
  fuente: string;
  ventana: string;
  desde: string;
  hasta: string;
  busqueda: string;
}

export interface FiltrosMedicionesProps {
  pendientes: MedicionesFiltrosState;
  aplicados: MedicionesFiltrosState;
  limnigrafosOpciones: { label: string; value: string }[];
  isPending?: boolean;
  errorCatalogo?: string;
  exportandoCSV?: boolean;
  onChange: <K extends keyof MedicionesFiltrosState>(_campo: K, _valor: MedicionesFiltrosState[K]) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
  onExportCSV: () => void;
  onImportar: () => void;
}

const labelFiltro: Record<keyof MedicionesFiltrosState, string> = {
  limnigrafo: "Limnígrafo",
  fuente: "Fuente",
  ventana: "Ventana de tiempo",
  desde: "Desde",
  hasta: "Hasta",
  busqueda: "Búsqueda",
};

const camposFiltro = Object.keys(labelFiltro) as (keyof MedicionesFiltrosState)[];

export function FiltrosMediciones({
  pendientes,
  aplicados,
  limnigrafosOpciones,
  isPending = false,
  errorCatalogo,
  exportandoCSV = false,
  onChange,
  onAplicar,
  onRestablecer,
  onExportCSV,
  onImportar,
}: FiltrosMedicionesProps) {
  const handleVentanaChange = (val: string) => {
    onChange("ventana", val);
    if (val !== "personalizado") {
      const fechas = obtenerFechasVentana(val);
      if (fechas) {
        onChange("desde", fechas.desde);
        onChange("hasta", fechas.hasta);
      }
    }
  };

  const estaActivo = (campo: keyof MedicionesFiltrosState) => {
    if (campo === "limnigrafo") return aplicados.limnigrafo !== "todos";
    if (campo === "fuente") return aplicados.fuente !== "todas";
    if (campo === "ventana") return Boolean(aplicados.ventana && aplicados.ventana !== "personalizado");
    if (campo === "desde") return aplicados.ventana === "personalizado" && Boolean(aplicados.desde);
    if (campo === "hasta") return aplicados.ventana === "personalizado" && Boolean(aplicados.hasta);
    return Boolean(aplicados[campo]);
  };

  const valorMostrado = (campo: keyof MedicionesFiltrosState) => {
    if (campo === "limnigrafo") {
      return limnigrafosOpciones.find((o) => o.value === aplicados.limnigrafo)?.label ?? aplicados.limnigrafo;
    }
    if (campo === "fuente") {
      return opcionesFuenteMedicion.find((o) => o.value === aplicados.fuente)?.label ?? aplicados.fuente;
    }
    if (campo === "ventana") {
      return opcionesVentanaTiempo.find((o) => o.value === aplicados.ventana)?.label ?? aplicados.ventana;
    }
    return aplicados[campo];
  };

  const filtrosActivos = camposFiltro.filter(estaActivo);

  const esRangoPersonalizado = pendientes.ventana === "personalizado";

  return (
    <Card className="p-2">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,auto)]">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="w-full">
            <Select
              label="Limnígrafo"
              name="limnigrafo"
              options={[{ label: "Todos", value: "todos" }, ...limnigrafosOpciones]}
              value={pendientes.limnigrafo}
              disabled={errorCatalogo !== undefined}
              onChange={(val) => onChange("limnigrafo", val)}
            />
            {errorCatalogo && <p className="mt-1 text-sm text-foreground-secondary">{errorCatalogo}</p>}
          </div>

          <div className="w-full">
            <Select
              label="Fuente"
              name="fuente"
              options={[{ label: "Todas", value: "todas" }, ...opcionesFuenteMedicion]}
              value={pendientes.fuente}
              onChange={(val) => onChange("fuente", val)}
            />
          </div>

          <div className="w-full">
            <Select
              label="Ventana de tiempo"
              name="ventana"
              options={opcionesVentanaTiempo}
              value={pendientes.ventana}
              onChange={handleVentanaChange}
            />
          </div>

          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="w-full">
            <DateField
              label="Desde"
              name="desde"
              disabled={!esRangoPersonalizado}
              value={pendientes.desde ? new Date(`${pendientes.desde}T00:00:00`) : undefined}
              onChange={(date) => date && onChange("desde", format(date, "yyyy-MM-dd"))}
            />
          </div>

          <div className="w-full">
            <DateField
              label="Hasta"
              name="hasta"
              disabled={!esRangoPersonalizado}
              value={pendientes.hasta ? new Date(`${pendientes.hasta}T00:00:00`) : undefined}
              onChange={(date) => date && onChange("hasta", format(date, "yyyy-MM-dd"))}
            />
          </div>
        </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 items-end gap-2">
          <Boton content="Restablecer" icon="restablecer" className="w-full" onClick={onRestablecer} disabled={isPending} />
          <Boton content="Aplicar filtros" icon="filtro" variant="primary" className="w-full" onClick={onAplicar} disabled={isPending} />
          <Boton content="Importar datos" icon="importar" className="w-full" onClick={onImportar} disabled={isPending} />
          <Boton
            content="Exportar CSV"
            icon="descargar"
            className="w-full"
            onClick={onExportCSV}
            disabled={isPending}
            loading={exportandoCSV}
          />
          {/* La exportación JSON queda desactivada hasta definir un caso de uso concreto. */}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:col-span-2">
          {filtrosActivos.length === 0 ? (
            <span className="text-sm text-foreground-disabled">Sin filtros activos</span>
          ) : (
            filtrosActivos.map((campo) => (
              <Chip key={campo} variant="info" size="sm">
                {labelFiltro[campo]}: {valorMostrado(campo)}
              </Chip>
            ))
          )}
        </div>

      </div>
    </Card>
  );
}

export default FiltrosMediciones;
