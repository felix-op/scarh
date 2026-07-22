"use client";

import { z } from "zod";
import { VentanaFormularioRHF } from "../ui/modals";
import { TextFieldRHF, TextAreaRHF, FileFieldRHF } from "../formularios";
import { SugerenciaObservacionRuta } from "./sugerencia-observacion-ruta";
import { usePostRutaAcceso, usePatchRutaAcceso } from "@hooks";
import { useMensajes } from "@services";
import type { RutaAccesoResponse } from "@models";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  tiempo_estimado_minutos: z.string().optional(),
  observaciones: z.string().optional(),
  archivo: z.instanceof(File).nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface VentanaCargarRutaProps {
  open: boolean;
  onClose: () => void;
  limnigrafoId: number;
  /** Si se provee, la ventana edita esa ruta; si no, crea una nueva. */
  ruta?: RutaAccesoResponse | null;
}

export function VentanaCargarRuta({ open, onClose, limnigrafoId, ruta }: VentanaCargarRutaProps) {
  const mensajes = useMensajes();
  const esEdicion = !!ruta;
  const { mutate: crearRuta, isPending: creando } = usePostRutaAcceso(limnigrafoId);
  const { mutate: editarRuta, isPending: editando } = usePatchRutaAcceso(limnigrafoId);
  const isPending = creando || editando;

  const onSubmit = (data: FormValues) => {
    if (!esEdicion && !data.archivo) {
      mensajes.error("Falta el archivo", "Debes seleccionar un archivo GPX o KML para crear la ruta.");
      return;
    }

    const fd = new FormData();
    fd.append("limnigrafo_id", String(limnigrafoId));
    fd.append("nombre", data.nombre);
    fd.append("observaciones", data.observaciones ?? "");
    if (data.tiempo_estimado_minutos) fd.append("tiempo_estimado_minutos", data.tiempo_estimado_minutos);
    if (data.archivo) fd.append("archivo_original", data.archivo);

    const onSuccess = () => {
      mensajes.success(
        esEdicion ? "Ruta actualizada" : "Ruta cargada",
        `La ruta ${data.nombre} se guardó correctamente.`
      );
      onClose();
    };
    const onError = (error: Error) => {
      mensajes.error("Error al guardar la ruta", error.message || "No se pudo guardar la ruta de acceso");
    };

    if (esEdicion && ruta) {
      editarRuta({ id: ruta.id, data: fd }, { onSuccess, onError });
    } else {
      crearRuta(fd, { onSuccess, onError });
    }
  };

  return (
    <VentanaFormularioRHF<FormValues>
      open={open}
      handleClose={onClose}
      zodSchema={formSchema}
      initialValues={{
        nombre: ruta?.nombre ?? "",
        tiempo_estimado_minutos: ruta?.tiempo_estimado_minutos != null ? String(ruta.tiempo_estimado_minutos) : "",
        observaciones: ruta?.observaciones ?? "",
        archivo: null,
      }}
      onSubmit={onSubmit}
      title={esEdicion ? "Editar ruta de acceso" : "Cargar ruta de acceso"}
      icon="importar"
      isLoading={isPending}
    >
      <div className="flex flex-col gap-4 py-2">
        <TextFieldRHF name="nombre" label="Nombre de la ruta" placeholder="Ej. Acceso norte" required />
        <TextFieldRHF
          name="tiempo_estimado_minutos"
          label="Tiempo estimado (minutos)"
          type="number"
          placeholder="Ej. 45"
        />
        <TextAreaRHF name="observaciones" label="Observaciones" placeholder="Notas sobre la ruta" rows={4} />
        <FileFieldRHF
          name="archivo"
          label="Archivo de traza"
          accept=".gpx,.kml"
          maxSizeMB={5}
          required={!esEdicion}
          helperText={
            esEdicion
              ? "Opcional: subí un nuevo archivo GPX/KML sólo si querés reemplazar la traza."
              : "Archivo GPX o KML (máx. 5 MB)."
          }
        />
        <SugerenciaObservacionRuta archivoFieldName="archivo" observacionFieldName="observaciones" />
      </div>
    </VentanaFormularioRHF>
  );
}

export default VentanaCargarRuta;
