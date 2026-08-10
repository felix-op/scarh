import { z } from "zod";

/**
 * Los campos de coordenadas se validan como texto y no como `z.number()` porque
 * un `<input>` siempre entrega `string`: con `z.coerce.number()` un campo vacío
 * se convierte en `0` (una coordenada válida en el Golfo de Guinea) en lugar de
 * fallar la validación.
 */
function coordenada(etiqueta: string, minimo: number, maximo: number) {
  return z
    .string()
    .trim()
    .min(1, `${etiqueta} es obligatoria`)
    .refine((valor) => Number.isFinite(Number(valor)), `${etiqueta} debe ser un número`)
    .refine(
      (valor) => Number(valor) >= minimo && Number(valor) <= maximo,
      `${etiqueta} debe estar entre ${minimo} y ${maximo}`
    );
}

/**
 * Formulario de edición de una `Ubicacion`. El modelo del backend sólo tiene
 * `nombre`, `latitud` y `longitud`: no hay altura sobre el nivel del mar, la
 * altura que muestra el mapa es `ultima_medicion.altura_agua` y es una medición,
 * no un dato editable de la ubicación.
 */
export const ubicacionEditarSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la ubicación es obligatorio"),
  longitud: coordenada("La longitud (X)", -180, 180),
  latitud: coordenada("La latitud (Y)", -90, 90),
});
