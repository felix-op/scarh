"use client";

import { z } from "zod";
import { VentanaFormularioRHF } from "../ui/modals";
import { TextFieldRHF, MemoryFieldRHF, MultiCheckboxRHF } from "../formularios";
import { usePostLimnigrafo } from "@hooks";
import { useMensajes } from "@services";
import { opcionesTipoComunicacion } from "@utils";

const formSchema = z.object({
  codigo: z.string().min(1, "El identificador es obligatorio"),
  memoria: z.number().nullable(),
  tipo_comunicacion: z.array(z.string()),
  radio_cobertura_metros: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface VentanaAgregarLimnigrafoProps {
  open: boolean;
  onClose: () => void;
}

export function VentanaAgregarLimnigrafo({ open, onClose }: VentanaAgregarLimnigrafoProps) {
  const mensajes = useMensajes();
  const { mutate: crearLimnigrafo, isPending } = usePostLimnigrafo();

  const onSubmit = (data: FormValues) => {
    crearLimnigrafo(
      {
        codigo: data.codigo,
        memoria: data.memoria,
        tipo_comunicacion: data.tipo_comunicacion,
        radio_cobertura_metros: data.radio_cobertura_metros ? Number(data.radio_cobertura_metros) : null,
      },
      {
        onSuccess: (creado) => {
          mensajes.success("Creado correctamente", `El limnígrafo ${creado?.codigo ?? data.codigo} se creó correctamente.`);
          onClose();
        },
        onError: (error: Error) => {
          mensajes.error("Error al crear", error.message || "No se pudo crear el limnígrafo");
        },
      }
    );
  };

  return (
    <VentanaFormularioRHF<FormValues>
      open={open}
      handleClose={onClose}
      zodSchema={formSchema}
      initialValues={{
        codigo: "",
        memoria: null,
        tipo_comunicacion: [],
        radio_cobertura_metros: "",
      }}
      onSubmit={onSubmit}
      title="Agregar Limnígrafo"
      icon="agregar"
      isLoading={isPending}
    >
      <div className="flex flex-col gap-4 py-2">
        <TextFieldRHF
          name="codigo"
          label="Identificador del limnígrafo"
          placeholder="Nombre o código para identificar"
          required
        />
        <MemoryFieldRHF name="memoria" label="Memoria del dispositivo" placeholder="Total de memoria" />
        <MultiCheckboxRHF
          name="tipo_comunicacion"
          label="Tipo de comunicación"
          options={opcionesTipoComunicacion}
          className="md:grid-cols-2"
        />
        <TextFieldRHF
          name="radio_cobertura_metros"
          label="Radio de cobertura estimada (m)"
          type="number"
          placeholder="Ej. 500"
        />
      </div>
    </VentanaFormularioRHF>
  );
}

export default VentanaAgregarLimnigrafo;
