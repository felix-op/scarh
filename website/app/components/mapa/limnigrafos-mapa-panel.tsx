"use client";

import { useState } from "react";
import { TextField } from "../ui/textfield";
import { Select } from "../ui/select";
import { BotonIcono } from "../ui/botones";
import { IconifyIcon } from "../ui/iconify-icon";
import { Chip } from "../ui/chip";

export interface FiltrosMapaState {
  busqueda: string;
  ubicacion: string;
  conexion: string;
  medicion: string;
}

export const FILTROS_MAPA_INICIALES: FiltrosMapaState = {
  busqueda: "",
  ubicacion: "todos",
  conexion: "todos",
  medicion: "todos",
};

const OPCIONES_UBICACION = [
  { label: "Todos", value: "todos" },
  { label: "Ubicados", value: "ubicados" },
  { label: "No ubicados", value: "no_ubicados" },
];

const OPCIONES_CONEXION = [
  { label: "Todos", value: "todos" },
  { label: "En línea", value: "en_linea" },
  { label: "Demorado", value: "demorado" },
  { label: "Sin conexión", value: "sin_conexion" },
];

const OPCIONES_MEDICION = [
  { label: "Todos", value: "todos" },
  { label: "Normal", value: "normal" },
  { label: "Fuera de rango", value: "fuera_de_rango" },
];

const LABEL_FILTRO: Record<keyof Omit<FiltrosMapaState, "busqueda">, string> = {
  ubicacion: "Ubicación",
  conexion: "Conexión",
  medicion: "Mediciones",
};

interface LimnigrafosMapaPanelProps {
  filtros: FiltrosMapaState;
  onChange: <K extends keyof FiltrosMapaState>(campo: K, valor: FiltrosMapaState[K]) => void;
}

export function LimnigrafosMapaPanel({ filtros, onChange }: LimnigrafosMapaPanelProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const chipsActivos = (
    [
      { campo: "ubicacion" as const, opciones: OPCIONES_UBICACION },
      { campo: "conexion" as const, opciones: OPCIONES_CONEXION },
      { campo: "medicion" as const, opciones: OPCIONES_MEDICION },
    ] as const
  ).filter((f) => filtros[f.campo] !== "todos");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <TextField
            name="busqueda-mapa"
            label=""
            placeholder="Buscá por código o ubicación"
            value={filtros.busqueda}
            onChange={(e) => onChange("busqueda", e.target.value)}
            leftIcon={<IconifyIcon variant="search" />}
          />
        </div>
        <BotonIcono
          icon="filtro"
          onClick={() => setMostrarFiltros((prev) => !prev)}
          aria-label={mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
          className={`transition-transform duration-300 ${mostrarFiltros ? "!bg-primary-light !text-primary rotate-180" : ""}`}
        />
      </div>

      {chipsActivos.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {chipsActivos.map((f) => (
            <Chip key={f.campo} variant="info" size="sm">
              {LABEL_FILTRO[f.campo]}: {f.opciones.find((o) => o.value === filtros[f.campo])?.label}
            </Chip>
          ))}
        </div>
      )}

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          mostrarFiltros ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pt-0.5">
            <Select
              label="Ubicación"
              name="filtro-ubicacion-mapa"
              options={OPCIONES_UBICACION}
              value={filtros.ubicacion}
              onChange={(val) => onChange("ubicacion", val)}
            />
            <Select
              label="Conexión"
              name="filtro-conexion-mapa"
              options={OPCIONES_CONEXION}
              value={filtros.conexion}
              onChange={(val) => onChange("conexion", val)}
            />
            <Select
              label="Mediciones"
              name="filtro-medicion-mapa"
              options={OPCIONES_MEDICION}
              value={filtros.medicion}
              onChange={(val) => onChange("medicion", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LimnigrafosMapaPanel;
