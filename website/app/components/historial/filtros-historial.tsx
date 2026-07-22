"use client";

import { format } from "date-fns";
import { Select, DateField, Chip, MenuExportar, Card } from "@components";
import { opcionesTipoAccion, opcionesEntidad, opcionesVentanaTiempo, obtenerFechasVentana } from "@utils";

export interface HistorialFiltrosState {
  tipo: string;
  entidad: string;
  usuario: string;
  ventana: string;
  desde: string;
  hasta: string;
}

export interface FiltrosHistorialProps {
  filtros: HistorialFiltrosState;
  usuariosOpciones: { label: string; value: string }[];
  isPending?: boolean;
  onChange: (cambios: Partial<HistorialFiltrosState>) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function FiltrosHistorial({
  filtros,
  usuariosOpciones,
  isPending = false,
  onChange,
  onExportCSV,
  onExportExcel,
  onExportPDF,
}: FiltrosHistorialProps) {
  const handleVentanaChange = (val: string) => {
    if (val !== "personalizado") {
      const fechas = obtenerFechasVentana(val);
      if (fechas) {
        onChange({ ventana: val, desde: fechas.desde, hasta: fechas.hasta });
        return;
      }
    }
    onChange({ ventana: val });
  };

  const esRangoPersonalizado = filtros.ventana === "personalizado";

  const estaActivo = (campo: keyof HistorialFiltrosState) => {
    if (campo === "tipo") return filtros.tipo !== "todas" && filtros.tipo !== "todos";
    if (campo === "entidad") return filtros.entidad !== "todas" && filtros.entidad !== "todos";
    if (campo === "usuario") return filtros.usuario !== "todos";
    if (campo === "ventana") return Boolean(filtros.ventana && filtros.ventana !== "personalizado");
    if (campo === "desde") return filtros.ventana === "personalizado" && Boolean(filtros.desde);
    if (campo === "hasta") return filtros.ventana === "personalizado" && Boolean(filtros.hasta);
    return false;
  };

  const valorMostrado = (campo: keyof HistorialFiltrosState) => {
    if (campo === "tipo") return opcionesTipoAccion.find((o) => o.value === filtros.tipo)?.label ?? filtros.tipo;
    if (campo === "entidad") return opcionesEntidad.find((o) => o.value === filtros.entidad)?.label ?? filtros.entidad;
    if (campo === "usuario") return usuariosOpciones.find((o) => o.value === filtros.usuario)?.label ?? filtros.usuario;
    if (campo === "ventana") return opcionesVentanaTiempo.find((o) => o.value === filtros.ventana)?.label ?? filtros.ventana;
    return filtros[campo];
  };

  const labelFiltro: Record<keyof HistorialFiltrosState, string> = {
    tipo: "Acción",
    entidad: "Entidad",
    usuario: "Usuario",
    ventana: "Ventana de tiempo",
    desde: "Desde",
    hasta: "Hasta",
  };

  const camposFiltro = Object.keys(labelFiltro) as (keyof HistorialFiltrosState)[];
  const filtrosActivos = camposFiltro.filter(estaActivo);

  return (
    <Card className="p-2">
      <div className="flex flex-col gap-4 w-full">
        {/* Fila 1: Filtros de entrada (Responsive grid: 1 col móvil, 2 col tablet, 6 col 2xl+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-6 gap-4 w-full">
          <div className="w-full">
            <Select
              label="Acción"
              name="tipo"
              options={[{ label: "Todas", value: "todas" }, ...opcionesTipoAccion]}
              value={filtros.tipo}
              onChange={(val) => onChange({ tipo: val })}
            />
          </div>

          <div className="w-full">
            <Select
              label="Entidad"
              name="entidad"
              options={[{ label: "Todas", value: "todas" }, ...opcionesEntidad]}
              value={filtros.entidad}
              onChange={(val) => onChange({ entidad: val })}
            />
          </div>

          <div className="w-full">
            <Select
              label="Usuario"
              name="usuario"
              options={[{ label: "Todos", value: "todos" }, ...usuariosOpciones]}
              value={filtros.usuario}
              onChange={(val) => onChange({ usuario: val })}
            />
          </div>

          <div className="w-full">
            <Select
              label="Ventana de tiempo"
              name="ventana"
              options={opcionesVentanaTiempo}
              value={filtros.ventana}
              onChange={handleVentanaChange}
            />
          </div>

          <div className="w-full">
            <DateField
              label="Desde"
              name="desde"
              disabled={!esRangoPersonalizado}
              value={filtros.desde ? new Date(`${filtros.desde}T00:00:00`) : undefined}
              onChange={(date) => date && onChange({ desde: format(date, "yyyy-MM-dd") })}
            />
          </div>

          <div className="w-full">
            <DateField
              label="Hasta"
              name="hasta"
              disabled={!esRangoPersonalizado}
              value={filtros.hasta ? new Date(`${filtros.hasta}T00:00:00`) : undefined}
              onChange={(date) => date && onChange({ hasta: format(date, "yyyy-MM-dd") })}
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
          <MenuExportar
            handleExportCSV={onExportCSV}
            handleExportExcel={onExportExcel}
            handleExportPDF={onExportPDF}
            disabled={isPending}
          />
        </div>
      </div>
    </Card>
  );
}

export default FiltrosHistorial;
