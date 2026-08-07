"use client";

import { Select } from "../ui/select";
import { Chip } from "../ui/chip";
import { Boton } from "../ui/botones";
import { Card } from "../ui/cards";
import {
  opcionesEstadoAlerta,
  opcionesTipoAlerta,
  opcionesLectura,
  opcionesCondicionAlerta,
  opcionesOrdenAlertas,
} from "@utils";

export interface AlertasFiltrosState {
  estado: string;
  limnigrafo: string;
  tipo: string;
  lectura: string;
  condicion: string;
  ordering: string;
}

export interface FiltrosAlertasProps {
  pendientes: AlertasFiltrosState;
  aplicados: AlertasFiltrosState;
  limnigrafosOpciones: { label: string; value: string }[];
  isPending?: boolean;
  onChange: <K extends keyof AlertasFiltrosState>(_campo: K, _valor: AlertasFiltrosState[K]) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
}

const labelFiltro: Record<keyof AlertasFiltrosState, string> = {
  estado: "Estado",
  limnigrafo: "Limnígrafo",
  tipo: "Tipo",
  lectura: "Lectura",
  condicion: "Condición",
  ordering: "Orden",
};

const camposFiltro = Object.keys(labelFiltro) as (keyof AlertasFiltrosState)[];

/** Valores que significan "sin filtrar" y por eso no generan chip. */
export const FILTROS_ALERTAS_POR_DEFECTO: AlertasFiltrosState = {
  estado: "todos",
  limnigrafo: "todos",
  tipo: "todos",
  lectura: "todas",
  condicion: "todas",
  ordering: "-fecha_hora",
};

export function FiltrosAlertas({
  pendientes,
  aplicados,
  limnigrafosOpciones,
  isPending = false,
  onChange,
  onAplicar,
  onRestablecer,
}: FiltrosAlertasProps) {
  const estaActivo = (campo: keyof AlertasFiltrosState) =>
    aplicados[campo] !== FILTROS_ALERTAS_POR_DEFECTO[campo];

  const valorMostrado = (campo: keyof AlertasFiltrosState) => {
    const buscarEn = (opciones: { label: string; value: string }[]) =>
      opciones.find((o) => o.value === aplicados[campo])?.label ?? aplicados[campo];

    if (campo === "estado") return buscarEn(opcionesEstadoAlerta);
    if (campo === "limnigrafo") return buscarEn(limnigrafosOpciones);
    if (campo === "tipo") return buscarEn(opcionesTipoAlerta);
    if (campo === "lectura") return buscarEn(opcionesLectura);
    if (campo === "condicion") return buscarEn(opcionesCondicionAlerta);
    return buscarEn(opcionesOrdenAlertas);
  };

  const filtrosActivos = camposFiltro.filter(estaActivo);

  return (
    <Card className="p-2">
      <div className="flex flex-col gap-4">
        {/* Fila 1: Campos de entrada (1 col móvil, 2 en sm/md, 5 en xl+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full">
          <div className="w-full">
            <Select
              label="Estado"
              name="estado"
              options={[{ label: "Todos", value: "todos" }, ...opcionesEstadoAlerta]}
              value={pendientes.estado}
              onChange={(val) => onChange("estado", val)}
            />
          </div>

          <div className="w-full">
            <Select
              label="Limnígrafo"
              name="limnigrafo"
              options={[{ label: "Todos", value: "todos" }, ...limnigrafosOpciones]}
              value={pendientes.limnigrafo}
              onChange={(val) => onChange("limnigrafo", val)}
            />
          </div>

          <div className="w-full">
            <Select
              label="Tipo de alerta"
              name="tipo"
              options={[{ label: "Todos", value: "todos" }, ...opcionesTipoAlerta]}
              value={pendientes.tipo}
              onChange={(val) => onChange("tipo", val)}
            />
          </div>

          <div className="w-full">
            <Select
              label="Lectura"
              name="lectura"
              options={opcionesLectura}
              value={pendientes.lectura}
              onChange={(val) => onChange("lectura", val)}
            />
          </div>

          <div className="w-full">
            <Select
              label="Condición"
              name="condicion"
              options={opcionesCondicionAlerta}
              value={pendientes.condicion}
              onChange={(val) => onChange("condicion", val)}
            />
          </div>

          {/* El orden va por selector y no por click en el header de la tabla:
              así queda explícito y sobrevive a la navegación por URL. */}
          <div className="w-full sm:col-span-2 xl:col-span-1">
            <Select
              label="Orden"
              name="ordering"
              options={opcionesOrdenAlertas}
              value={pendientes.ordering}
              onChange={(val) => onChange("ordering", val)}
            />
          </div>
        </div>

        {/* Fila 2: Chips de filtros activos */}
        <div className="flex flex-wrap items-center gap-2 w-full">
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

        {/* Fila 3: Botones de acción alineados a la derecha */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
          <Boton content="Restablecer" icon="restablecer" onClick={onRestablecer} disabled={isPending} />
          <Boton content="Aplicar filtros" icon="filtro" variant="primary" onClick={onAplicar} disabled={isPending} />
        </div>
      </div>
    </Card>
  );
}
