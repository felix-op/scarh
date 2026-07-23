"use client";

import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";
import { Formulario } from "../formularios/formulario";
import { SeccionAgruparInformacion } from "../ui";
import { TextFieldRHF, MemoryFieldRHF, MultiCheckboxRHF, TimeHMSFieldRHF, DateFieldRHF, FormAcciones } from "../formularios";
import { InfoTooltip } from "../ui/info-tooltip";
import { Alert } from "../ui/alerts";
import { BotonVolver } from "../ui/botones";
import { useEditarLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import { opcionesTipoComunicacion, tieneCoberturaAlertas, toNum, toStr } from "@utils";
import type { LimnigrafoResponse } from "@models";
import { useState } from "react";


const formSchema = z.object({
  // Datos del limnígrafo
  codigo: z.string().min(1, "El identificador es obligatorio"),
  descripcion: z.string().optional(),
  ultimo_mantenimiento: z.date().nullable().optional(),
  memoria: z.number().nullable(),
  bateria_min: z.string().optional(),
  bateria_max: z.string().optional(),
  radio_cobertura_metros: z.string().optional(),
  // Configuración de alertas
  tipo_comunicacion: z.array(z.string()),
  tiempo_advertencia: z.number().nullable(),
  tiempo_peligro: z.number().nullable(),
  altura_minima_agua: z.string().optional(),
  altura_maxima_agua: z.string().optional(),
  temperatura_minima: z.string().optional(),
  temperatura_maxima: z.string().optional(),
  presion_minima: z.string().optional(),
  presion_maxima: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;


export interface FormEditarLimnigrafoProps {
  limnigrafo: LimnigrafoResponse;
}

function BannerSinAlertas({ nombreCampo }: { nombreCampo: string }) {
  const tipoComunicacion = useWatch<FormValues>({ name: nombreCampo as keyof FormValues }) as string[];
  const tieneCobertura = tieneCoberturaAlertas(tipoComunicacion);

  if (tieneCobertura) return null;

  return (
    <Alert
      variant="alerta"
      title="Sin cobertura para alertas"
    >
      Este limnígrafo no será tenido en cuenta para el sistema de alertas porque ninguno de los tipos de comunicación seleccionados es compatible (2G, 3G, 4G, 5G, SMS o SMTP).
    </Alert>
  );
}

export function FormEditarLimnigrafo({ limnigrafo }: FormEditarLimnigrafoProps) {
  const router = useRouter();
  const mensajes = useMensajes();
  const { mutate: editarLimnigrafo } = useEditarLimnigrafo();
  const [isSaving, setIsSaving] = useState(false);

  const cfg = limnigrafo.configuracion;
  const id = String(limnigrafo.id);

  const initialValues: FormValues = {
    // Datos del limnígrafo
    codigo: limnigrafo.codigo ?? "",
    descripcion: limnigrafo.descripcion ?? "",
    ultimo_mantenimiento: limnigrafo.ultimo_mantenimiento 
      ? new Date(`${limnigrafo.ultimo_mantenimiento}T00:00:00`) 
      : null,
    memoria: limnigrafo.memoria ?? null,
    bateria_min: toStr(cfg?.bateria_min),
    bateria_max: toStr(cfg?.bateria_max),
    radio_cobertura_metros: toStr(limnigrafo.radio_cobertura_metros),
    // Configuración de alertas
    tipo_comunicacion: limnigrafo.tipo_comunicacion ?? [],
    tiempo_advertencia: cfg?.tiempo_advertencia ?? null,
    tiempo_peligro: cfg?.tiempo_peligro ?? null,
    altura_minima_agua: toStr(cfg?.altura_minima_agua),
    altura_maxima_agua: toStr(cfg?.altura_maxima_agua),
    temperatura_minima: toStr(cfg?.temperatura_minima),
    temperatura_maxima: toStr(cfg?.temperatura_maxima),
    presion_minima: toStr(cfg?.presion_minima),
    presion_maxima: toStr(cfg?.presion_maxima),
  };

  const onSubmit = (data: FormValues) => {
    setIsSaving(true);
    editarLimnigrafo(
      {
        id,
        data: {
          // Datos del limnígrafo
          codigo: data.codigo,
          descripcion: data.descripcion ?? "",
          ultimo_mantenimiento: data.ultimo_mantenimiento 
            ? format(data.ultimo_mantenimiento, "yyyy-MM-dd") 
            : null,
          tipo_comunicacion: data.tipo_comunicacion,
          memoria: data.memoria,
          radio_cobertura_metros: toNum(data.radio_cobertura_metros),
          ubicacion_id: limnigrafo.ubicacion_id,
          // Configuración
          tiempo_advertencia: data.tiempo_advertencia,
          tiempo_peligro: data.tiempo_peligro,
          bateria_max: toNum(data.bateria_max),
          bateria_min: toNum(data.bateria_min),
          altura_minima_agua: toNum(data.altura_minima_agua),
          altura_maxima_agua: toNum(data.altura_maxima_agua),
          temperatura_minima: toNum(data.temperatura_minima),
          temperatura_maxima: toNum(data.temperatura_maxima),
          presion_minima: toNum(data.presion_minima),
          presion_maxima: toNum(data.presion_maxima),
        },
      },
      {
        onSuccess: () => {
          mensajes.success("Guardado correctamente", `El limnígrafo ${data.codigo} se actualizó correctamente.`);
          router.push("/dashboard/limnigrafos");
        },
        onError: (error: Error) => {
          mensajes.error("Error al guardar", error.message || "No se pudo actualizar el limnígrafo");
        },
        onSettled: () => {
          setIsSaving(false);
        },
      }
    );
  };

  return (
    <>
      <div className="self-start">
        <BotonVolver content="Volver" onClick={() => router.push(`/dashboard/limnigrafos/datos/${id}`)} />
      </div>

      <Formulario<FormValues>
        zodSchema={formSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
        isLoading={isSaving}
        className="flex flex-col gap-6"
      >
      {/* ── Card 1: Datos del limnígrafo ─────────────────────── */}
      <SeccionAgruparInformacion title="Datos del limnígrafo">
        <TextFieldRHF name="codigo" label="Identificador del limnígrafo" required />
        <DateFieldRHF name="ultimo_mantenimiento" label="Último mantenimiento" />
        <TextFieldRHF name="descripcion" label="Descripción" placeholder="Descripción del limnígrafo" />
        <MemoryFieldRHF name="memoria" label="Memoria del dispositivo" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextFieldRHF name="bateria_min" label="Batería mínima (V)" type="number" placeholder="Ej. 11" />
          <TextFieldRHF name="bateria_max" label="Batería máxima (V)" type="number" placeholder="Ej. 14" />
        </div>

        <TextFieldRHF name="radio_cobertura_metros" label="Radio de cobertura estimada (m)" type="number" placeholder="Ej. 500" />
      </SeccionAgruparInformacion>

      {/* ── Card 2: Configuración de alertas ─────────────────── */}
      <SeccionAgruparInformacion title="Configuración de alertas">
        {/* Tipo de comunicación y banner van primero */}
        <MultiCheckboxRHF
          name="tipo_comunicacion"
          label="Tipo de comunicación"
          options={opcionesTipoComunicacion}
          className="md:grid-cols-2"
        />
        <BannerSinAlertas nombreCampo="tipo_comunicacion" />

        <TimeHMSFieldRHF
          name="tiempo_advertencia"
          label="Tiempo máximo antes de Advertencia"
          tooltip={
            <InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Advertencia." />
          }
        />
        <TimeHMSFieldRHF
          name="tiempo_peligro"
          label="Tiempo máximo antes de Peligro"
          tooltip={
            <InfoTooltip content="Tiempo sin recibir datos tras el cual el limnígrafo pasa a estado de Peligro." />
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextFieldRHF name="altura_minima_agua" label="Altura mínima del agua" type="number" />
          <TextFieldRHF name="altura_maxima_agua" label="Altura máxima del agua" type="number" />
          <TextFieldRHF name="temperatura_minima" label="Temperatura mínima" type="number" />
          <TextFieldRHF name="temperatura_maxima" label="Temperatura máxima" type="number" />
          <TextFieldRHF name="presion_minima" label="Presión mínima" type="number" />
          <TextFieldRHF name="presion_maxima" label="Presión máxima" type="number" />
        </div>
      </SeccionAgruparInformacion>

        <FormAcciones isSaving={isSaving} onCancel={() => router.back()} />
      </Formulario>
    </>
  );
}
