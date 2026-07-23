"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Ventana } from "../ui/modals";
import { DateTextField } from "../ui/date-textfield";
import { TimeField } from "../ui/timefield";
import { TextField } from "../ui/textfield";
import { BotonGuardar, BotonCancelar } from "../ui/botones";
import type { FormatoImportacionMediciones } from "./configuraciones-tabla";
import type { MedicionRowType } from "@utils";

interface VentanaEditarMedicionProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (row: MedicionRowType) => void;
  row: MedicionRowType | null;
  /** Oculta presión, temperatura y batería cuando el archivo importado es de formato viejo. */
  formato?: FormatoImportacionMediciones;
}

interface FormState {
  fecha?: Date;
  hora: string;
  alturaAgua: string;
  presion: string;
  temperatura: string;
  nivelBateria: string;
}

function toFormState(row: MedicionRowType | null): FormState {
  const vacio: FormState = { fecha: undefined, hora: "", alturaAgua: "", presion: "", temperatura: "", nivelBateria: "" };
  if (!row) return vacio;

  const date = row.fechaHora ? new Date(row.fechaHora) : null;
  const fechaValida = date && !Number.isNaN(date.getTime()) ? date : undefined;

  return {
    fecha: fechaValida,
    hora: fechaValida ? format(fechaValida, "HH:mm") : "",
    alturaAgua: row.alturaAgua !== null ? String(row.alturaAgua) : "",
    presion: row.presion !== null ? String(row.presion) : "",
    temperatura: row.temperatura !== null ? String(row.temperatura) : "",
    nivelBateria: row.nivelBateria !== null ? String(row.nivelBateria) : "",
  };
}

function parseCampoNumerico(valor: string): number | null {
  if (valor.trim() === "") return null;
  const num = Number(valor.replace(",", "."));
  return Number.isNaN(num) ? null : num;
}

export function VentanaEditarMedicion({ isOpen, onClose, onSave, row, formato = "nuevo" }: VentanaEditarMedicionProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(row));

  if (!row) return null;

  const muestraCamposFormatoNuevo = formato === "nuevo";

  const handleGuardar = () => {
    let fechaHora: string | null = null;
    if (form.fecha) {
      const [horas, minutos] = form.hora ? form.hora.split(":").map(Number) : [0, 0];
      const combinada = new Date(form.fecha);
      combinada.setHours(horas || 0, minutos || 0, 0, 0);
      fechaHora = combinada.toISOString();
    }

    onSave({
      ...row,
      fechaHora,
      fechaHoraOriginal: null,
      alturaAgua: parseCampoNumerico(form.alturaAgua),
      presion: parseCampoNumerico(form.presion),
      temperatura: parseCampoNumerico(form.temperatura),
      nivelBateria: parseCampoNumerico(form.nivelBateria),
    });
  };

  return (
    <Ventana open={isOpen} handleClose={onClose} title={`Editar fila Nº ${row.rowNumber}`}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateTextField
            label="Fecha"
            name="fecha"
            required
            value={form.fecha}
            onChange={(fecha) => setForm((prev) => ({ ...prev, fecha }))}
          />
          <TimeField
            label="Hora"
            name="hora"
            required
            value={form.hora}
            onChange={(e) => setForm((prev) => ({ ...prev, hora: e.target.value }))}
          />
        </div>

        <TextField
          label="Altura de agua (m)"
          name="alturaAgua"
          type="number"
          step="0.01"
          required
          value={form.alturaAgua}
          onChange={(e) => setForm((prev) => ({ ...prev, alturaAgua: e.target.value }))}
        />

        {muestraCamposFormatoNuevo && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Presión (hPa)"
                name="presion"
                type="number"
                step="0.01"
                value={form.presion}
                onChange={(e) => setForm((prev) => ({ ...prev, presion: e.target.value }))}
              />
              <TextField
                label="Temperatura (°C)"
                name="temperatura"
                type="number"
                step="0.01"
                value={form.temperatura}
                onChange={(e) => setForm((prev) => ({ ...prev, temperatura: e.target.value }))}
              />
            </div>

            <TextField
              label="Nivel de batería (%)"
              name="nivelBateria"
              type="number"
              step="0.1"
              value={form.nivelBateria}
              onChange={(e) => setForm((prev) => ({ ...prev, nivelBateria: e.target.value }))}
            />
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <BotonCancelar onClick={onClose} className="flex-1 sm:flex-none" />
          <BotonGuardar onClick={handleGuardar} className="flex-1 sm:flex-none" />
        </div>
      </div>
    </Ventana>
  );
}
