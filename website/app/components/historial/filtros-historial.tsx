"use client";

import { format } from "date-fns";
import { Select, DateField, Chip, Boton, MenuExportar, Card } from "@components";
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
  pendientes: HistorialFiltrosState;
  aplicados: HistorialFiltrosState;
  usuariosOpciones: { label: string; value: string }[];
  isPending?: boolean;
  onChange: (cambios: Partial<HistorialFiltrosState>) => void;
  onAplicar: () => void;
  onRestablecer: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export function FiltrosHistorial({
  pendientes,
  aplicados,
  usuariosOpciones,
  isPending = false,
  onChange,
  onAplicar,
  onRestablecer,
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

  const esRangoPersonalizado = pendientes.ventana === "personalizado";

  const estaActivo = (campo: keyof HistorialFiltrosState) => {
    if (campo === "tipo") return aplicados.tipo !== "todas" && aplicados.tipo !== "todos";
    if (campo === "entidad") return aplicados.entidad !== "todas" && aplicados.entidad !== "todos";
    if (campo === "usuario") return aplicados.usuario !== "todos";
    if (campo === "ventana") return Boolean(aplicados.ventana && aplicados.ventana !== "personalizado");
    if (campo === "desde") return aplicados.ventana === "personalizado" && Boolean(aplicados.desde);
    if (campo === "hasta") return aplicados.ventana === "personalizado" && Boolean(aplicados.hasta);
    return false;
  };

  const valorMostrado = (campo: keyof HistorialFiltrosState) => {
    if (campo === "tipo") return opcionesTipoAccion.find((o) => o.value === aplicados.tipo)?.label ?? aplicados.tipo;
    if (campo === "entidad") return opcionesEntidad.find((o) => o.value === aplicados.entidad)?.label ?? aplicados.entidad;
    if (campo === "usuario") return usuariosOpciones.find((o) => o.value === aplicados.usuario)?.label ?? aplicados.usuario;
    if (campo === "ventana") return opcionesVentanaTiempo.find((o) => o.value === aplicados.ventana)?.label ?? aplicados.ventana;
    return aplicados[campo];
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
              value={pendientes.tipo}
              onChange={(val) => onChange({ tipo: val })}
            />
          </div>

          <div className="w-full">
            <Select
              label="Entidad"
              name="entidad"
              options={[{ label: "Todas", value: "todas" }, ...opcionesEntidad]}
              value={pendientes.entidad}
              onChange={(val) => onChange({ entidad: val })}
            />
          </div>

          <div className="w-full">
            <Select
              label="Usuario"
              name="usuario"
              options={[{ label: "Todos", value: "todos" }, ...usuariosOpciones]}
              value={pendientes.usuario}
              onChange={(val) => onChange({ usuario: val })}
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

          <div className="w-full">
            <DateField
              label="Desde"
              name="desde"
              disabled={!esRangoPersonalizado}
              value={pendientes.desde ? new Date(`${pendientes.desde}T00:00:00`) : undefined}
              onChange={(date) => date && onChange({ desde: format(date, "yyyy-MM-dd") })}
            />
          </div>

          <div className="w-full">
            <DateField
              label="Hasta"
              name="hasta"
              disabled={!esRangoPersonalizado}
              value={pendientes.hasta ? new Date(`${pendientes.hasta}T00:00:00`) : undefined}
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
    </Card>
  );
}

export default FiltrosHistorial;
