"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Formulario } from "../formularios/formulario";
import { Card } from "../ui/cards";
import { TextFieldRHF, MemoryFieldRHF, MultiCheckboxRHF, TimeHMSFieldRHF, DateFieldRHF } from "../formularios";
import { BotonGuardar, BotonCancelar } from "../ui/botones";
import { InfoTooltip } from "../ui/info-tooltip";
import { usePutLimnigrafo, usePatchConfiguracionLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import { opcionesTipoComunicacion } from "@utils";
import type { LimnigrafoResponse } from "@models";

const formSchema = z.object({
  codigo: z.string().min(1, "El identificador es obligatorio"),
  descripcion: z.string().optional(),
  ultimo_mantenimiento: z.string().optional(),
  memoria: z.number().nullable(),
  tipo_comunicacion: z.array(z.string()),
  radio_cobertura_metros: z.string().optional(),
  bateria_min: z.string().optional(),
  altura_minima_agua: z.string().optional(),
  altura_maxima_agua: z.string().optional(),
  temperatura_minima: z.string().optional(),
  temperatura_maxima: z.string().optional(),
  presion_minima: z.string().optional(),
  presion_maxima: z.string().optional(),
  tiempo_advertencia: z.number().nullable(),
  tiempo_peligro: z.number().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const toNum = (s?: string): number | null => (s && s.trim() !== "" ? Number(s) : null);
const toStr = (n: number | null | undefined): string => (n != null ? String(n) : "");

export interface FormEditarLimnigrafoProps {
  limnigrafo: LimnigrafoResponse;
}

export function FormEditarLimnigrafo({ limnigrafo }: FormEditarLimnigrafoProps) {
  const router = useRouter();
  const mensajes = useMensajes();
  const { mutateAsync: putLimnigrafo } = usePutLimnigrafo();
  const { mutateAsync: patchConfiguracion } = usePatchConfiguracionLimnigrafo();
  const [isSaving, setIsSaving] = useState(false);

  const cfg = limnigrafo.configuracion;
  const id = String(limnigrafo.id);

  const initialValues: FormValues = {
    codigo: limnigrafo.codigo ?? "",
    descripcion: limnigrafo.descripcion ?? "",
    ultimo_mantenimiento: limnigrafo.ultimo_mantenimiento ?? "",
    memoria: limnigrafo.memoria ?? null,
    tipo_comunicacion: limnigrafo.tipo_comunicacion ?? [],
    radio_cobertura_metros: toStr(limnigrafo.radio_cobertura_metros),
    bateria_min: toStr(cfg?.bateria_min),
    altura_minima_agua: toStr(cfg?.altura_minima_agua),
    altura_maxima_agua: toStr(cfg?.altura_maxima_agua),
    temperatura_minima: toStr(cfg?.temperatura_minima),
    temperatura_maxima: toStr(cfg?.temperatura_maxima),
    presion_minima: toStr(cfg?.presion_minima),
    presion_maxima: toStr(cfg?.presion_maxima),
    tiempo_advertencia: cfg?.tiempo_advertencia ?? null,
    tiempo_peligro: cfg?.tiempo_peligro ?? null,
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await putLimnigrafo({
        id,
        data: {
          codigo: data.codigo,
          descripcion: data.descripcion ?? "",
          ultimo_mantenimiento: data.ultimo_mantenimiento || null,
          tipo_comunicacion: data.tipo_comunicacion,
          memoria: data.memoria,
          radio_cobertura_metros: toNum(data.radio_cobertura_metros),
        },
      });

      await patchConfiguracion({
        id,
        data: {
          tiempo_advertencia: data.tiempo_advertencia,
          tiempo_peligro: data.tiempo_peligro,
          bateria_min: toNum(data.bateria_min),
          altura_minima_agua: toNum(data.altura_minima_agua),
          altura_maxima_agua: toNum(data.altura_maxima_agua),
          temperatura_minima: toNum(data.temperatura_minima),
          temperatura_maxima: toNum(data.temperatura_maxima),
          presion_minima: toNum(data.presion_minima),
          presion_maxima: toNum(data.presion_maxima),
        },
      });

      mensajes.success("Guardado correctamente", `El limnígrafo ${data.codigo} se actualizó correctamente.`);
      router.push("/dashboard/limnigrafos");
    } catch (error) {
      mensajes.error("Error al guardar", (error as Error).message || "No se pudo actualizar el limnígrafo");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Formulario<FormValues>
      zodSchema={formSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
      isLoading={isSaving}
      className="flex flex-col gap-6"
    >
      <Card className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos del limnígrafo */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground-title">Datos del limnígrafo</h2>
            <TextFieldRHF name="codigo" label="Identificador del limnígrafo" required />
            <TextFieldRHF name="descripcion" label="Descripción" placeholder="Descripción del limnígrafo" />
          </div>

          {/* Mantenimiento */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground-title">Mantenimiento</h2>
            <DateFieldRHF name="ultimo_mantenimiento" label="Último mantenimiento" />
            <TimeHMSFieldRHF
              name="tiempo_advertencia"
              label="Tiempo máximo antes de Advertencia"
              tooltip={
                <InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Advertencia." />
              }
            />
            <TimeHMSFieldRHF
              name="tiempo_peligro"
              label="Tiempo máximo antes de Fuera de rango"
              tooltip={
                <InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado Fuera de rango." />
              }
            />
          </div>
        </div>
      </Card>

      {/* Especificaciones técnicas */}
      <Card className="p-5">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground-title">Especificaciones técnicas</h2>
          <MemoryFieldRHF name="memoria" label="Memoria del dispositivo" />
          <TextFieldRHF name="bateria_min" label="Batería mínima (V)" type="number" placeholder="Ej. 11" />
          <TextFieldRHF name="radio_cobertura_metros" label="Radio de cobertura estimada (m)" type="number" placeholder="Ej. 500" />

          <div className="grid grid-cols-2 gap-4">
            <TextFieldRHF name="altura_maxima_agua" label="Altura máxima del agua" type="number" />
            <TextFieldRHF name="altura_minima_agua" label="Altura mínima del agua" type="number" />
            <TextFieldRHF name="temperatura_maxima" label="Temperatura máxima" type="number" />
            <TextFieldRHF name="temperatura_minima" label="Temperatura mínima" type="number" />
            <TextFieldRHF name="presion_maxima" label="Presión máxima" type="number" />
            <TextFieldRHF name="presion_minima" label="Presión mínima" type="number" />
          </div>

          <MultiCheckboxRHF
            name="tipo_comunicacion"
            label="Tipo de comunicación"
            options={opcionesTipoComunicacion}
            className="md:grid-cols-2"
          />
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <BotonCancelar content="Cancelar" onClick={() => router.back()} disabled={isSaving} />
        <BotonGuardar type="submit" content="Guardar cambios" loading={isSaving} disabled={isSaving} />
      </div>
    </Formulario>
  );
}

export default FormEditarLimnigrafo;
