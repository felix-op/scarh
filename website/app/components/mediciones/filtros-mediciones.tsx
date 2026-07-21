"use client";

import { ChangeEvent } from "react";
import { format } from "date-fns";
import { Select } from "../ui/select";
import { DateField } from "../ui/datefield";
import { TextField } from "../ui/textfield";
import { Chip } from "../ui/chip";
import { Boton } from "../ui/botones";
import { MenuExportar } from "../menu-exportar";
import { opcionesFuenteMedicion } from "@utils";

export interface MedicionesFiltrosState {
  limnigrafo: string;
  fuente: string;
  desde: string;
  hasta: string;
  busqueda: string;
}

export interface FiltrosMedicionesProps {
  pendientes: MedicionesFiltrosState;
  aplicados: MedicionesFiltrosState;
  limnigrafosOpciones: { label: string; value: string }[];
  isPending?: boolean;
  onChange: <K extends keyof MedicionesFiltrosState>(campo: K, valor: MedicionesFiltrosState[K]) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

const labelFiltro: Record<keyof MedicionesFiltrosState, string> = {
  limnigrafo: "Limnígrafo",
  fuente: "Fuente",
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
  onChange,
  onAplicar,
  onRestablecer,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}: FiltrosMedicionesProps) {
  const estaActivo = (campo: keyof MedicionesFiltrosState) => {
    if (campo === "limnigrafo") return aplicados.limnigrafo !== "todos";
    if (campo === "fuente") return aplicados.fuente !== "todas";
    return Boolean(aplicados[campo]);
  };

  const valorMostrado = (campo: keyof MedicionesFiltrosState) => {
    if (campo === "limnigrafo") {
      return limnigrafosOpciones.find((o) => o.value === aplicados.limnigrafo)?.label ?? aplicados.limnigrafo;
    }
    if (campo === "fuente") {
      return opcionesFuenteMedicion.find((o) => o.value === aplicados.fuente)?.label ?? aplicados.fuente;
    }
    return aplicados[campo];
  };

  const filtrosActivos = camposFiltro.filter(estaActivo);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="w-full md:w-48">
          <Select
            label="Limnígrafo"
            name="limnigrafo"
            options={[{ label: "Todos", value: "todos" }, ...limnigrafosOpciones]}
            value={pendientes.limnigrafo}
            onChange={(val) => onChange("limnigrafo", val)}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            label="Fuente"
            name="fuente"
            options={[{ label: "Todas", value: "todas" }, ...opcionesFuenteMedicion]}
            value={pendientes.fuente}
            onChange={(val) => onChange("fuente", val)}
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            label="Ventana de tiempo"
            name="ventana"
            options={[{ label: "Rango personalizado", value: "personalizado" }]}
            value="personalizado"
            onChange={() => {}}
          />
        </div>

        <div className="w-full md:w-40">
          <DateField
            label="Desde"
            name="desde"
            value={pendientes.desde ? new Date(`${pendientes.desde}T00:00:00`) : undefined}
            onChange={(date) => date && onChange("desde", format(date, "yyyy-MM-dd"))}
          />
        </div>

        <div className="w-full md:w-40">
          <DateField
            label="Hasta"
            name="hasta"
            value={pendientes.hasta ? new Date(`${pendientes.hasta}T00:00:00`) : undefined}
            onChange={(date) => date && onChange("hasta", format(date, "yyyy-MM-dd"))}
          />
        </div>

        <div className="w-full md:w-56">
          <TextField
            label="Búsqueda"
            name="busqueda"
            placeholder="ID, limnígrafo, valores..."
            value={pendientes.busqueda}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange("busqueda", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
        <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-3">
          <Boton content="Restablecer" icon="restablecer" onClick={onRestablecer} disabled={isPending} />
          <Boton content="Aplicar filtros" icon="filtro" variant="primary" onClick={onAplicar} disabled={isPending} />
          <MenuExportar
            handleExportCSV={onExportCSV}
            handleExportExcel={onExportExcel}
            handleExportPDF={onExportPDF}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}

export default FiltrosMediciones;
