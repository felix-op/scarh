import { z } from "zod";

/** Payload JSON validado en el route handler POST /api/limnigrafos. */
export const limnigrafoPostSchema = z.object({
  codigo: z.string().min(1, "El identificador es obligatorio"),
  memoria: z.number().nullable().optional(),
  tipo_comunicacion: z.array(z.string()),
  radio_cobertura_metros: z.number().nullable().optional(),
});

/** Payload JSON validado en el route handler PUT /api/limnigrafos/[id]. */
export const limnigrafoPutSchema = z.object({
  codigo: z.string().min(1, "El identificador es obligatorio"),
  descripcion: z.string(),
  ultimo_mantenimiento: z.string().nullable().optional(),
  tipo_comunicacion: z.array(z.string()),
  memoria: z.number().nullable().optional(),
  radio_cobertura_metros: z.number().nullable().optional(),
});

/** Payload JSON validado en el route handler POST /api/limnigrafos/[id]/configuracion. */
export const configuracionPostSchema = z.object({
  tiempo_advertencia: z.number().nullable().optional(),
  tiempo_peligro: z.number().nullable().optional(),
  bateria_max: z.number().nullable().optional(),
  bateria_min: z.number().nullable().optional(),
  altura_minima_agua: z.number().nullable().optional(),
  altura_maxima_agua: z.number().nullable().optional(),
  temperatura_minima: z.number().nullable().optional(),
  temperatura_maxima: z.number().nullable().optional(),
  presion_minima: z.number().nullable().optional(),
  presion_maxima: z.number().nullable().optional(),
});

/**
 * Payload combinado validado en el route handler PUT /api/limnigrafos/[id]/editar.
 * Fusión de los campos de limnigrafo y configuración.
 */
export const limnigrafoEditarSchema = limnigrafoPutSchema.merge(
  z.object({
    ubicacion_id: z.number().nullable().optional(),
    tiempo_advertencia: z.number().nullable().optional(),
    tiempo_peligro: z.number().nullable().optional(),
    bateria_max: z.number().nullable().optional(),
    bateria_min: z.number().nullable().optional(),
    altura_minima_agua: z.number().nullable().optional(),
    altura_maxima_agua: z.number().nullable().optional(),
    temperatura_minima: z.number().nullable().optional(),
    temperatura_maxima: z.number().nullable().optional(),
    presion_minima: z.number().nullable().optional(),
    presion_maxima: z.number().nullable().optional(),
  })
);
