import { z } from "zod";
import type { AgrupacionEstadistica, AtributoEstadistica } from "@models";
import {
  AGRUPACION_POR_DEFECTO,
  ATRIBUTO_POR_DEFECTO,
  VENTANAS_ESTADISTICAS,
  VENTANA_POR_DEFECTO,
  VISTAS_ESTADISTICAS,
  VISTA_POR_DEFECTO,
  opcionesAgrupacionPeriodo,
  type VistaEstadistica,
} from "./constantes-estadisticas";
import { ATRIBUTO_METADATA } from "./mediciones.formato";
import { FORMATO_FECHA, obtenerRangoVentana } from "./estadisticas.utiles";

/**
 * Estado completo de la consulta de estadísticas. Es lo que viaja en la URL, así
 * que una vista compartida se reproduce tal cual del otro lado.
 *
 * `limnigrafos` es una lista **en las tres vistas**: la de resumen opera sobre el
 * primero y ofrece los demás como accesos rápidos, de modo que cambiar de pestaña
 * nunca pierde la selección.
 *
 * @property {VistaEstadistica} vista Pestaña activa.
 * @property {AtributoEstadistica} atributo Variable analizada.
 * @property {number[]} limnigrafos IDs seleccionados, en orden de selección.
 * @property {string} ventana Ventana rápida, o `personalizado`.
 * @property {string} desde Comienzo del rango en `yyyy-MM-dd`.
 * @property {string} hasta Fin del rango en `yyyy-MM-dd`, incluido.
 * @property {AgrupacionEstadistica} agrupar Granularidad de la vista de resumen.
 */
export interface FiltrosEstadisticasState {
  vista: VistaEstadistica;
  atributo: AtributoEstadistica;
  limnigrafos: number[];
  ventana: string;
  desde: string;
  hasta: string;
  agrupar: AgrupacionEstadistica;
}

const VISTAS = VISTAS_ESTADISTICAS.map((vista) => vista.value) as [VistaEstadistica, ...VistaEstadistica[]];
const ATRIBUTOS = Object.keys(ATRIBUTO_METADATA) as [AtributoEstadistica, ...AtributoEstadistica[]];
const VENTANAS = VENTANAS_ESTADISTICAS.map((ventana) => ventana.value) as [string, ...string[]];
const AGRUPACIONES = opcionesAgrupacionPeriodo.map((opcion) => opcion.value) as [
  AgrupacionEstadistica,
  ...AgrupacionEstadistica[],
];


/**
 * Esquema tolerante para leer `searchParams`.
 *
 * Cada campo cae al valor por defecto si viene ausente o inválido: una URL
 * manipulada a mano tiene que degradar a la vista por defecto, no romper la
 * página con un 500.
 */
const searchParamsSchema = z.object({
  vista: z.enum(VISTAS).catch(VISTA_POR_DEFECTO),
  atributo: z.enum(ATRIBUTOS).catch(ATRIBUTO_POR_DEFECTO),
  limnigrafos: z
    .string()
    .transform(parsearListaIds)
    .catch([] as number[]),
  ventana: z.enum(VENTANAS).catch(VENTANA_POR_DEFECTO),
  desde: z.string().regex(FORMATO_FECHA).optional().catch(undefined),
  hasta: z.string().regex(FORMATO_FECHA).optional().catch(undefined),
  agrupar: z.enum(AGRUPACIONES).catch(AGRUPACION_POR_DEFECTO),
});

function parsearListaIds(valor: string): number[] {
  const ids = valor
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  return Array.from(new Set(ids));
}

/**
 * Lee los `searchParams` de la página y devuelve filtros siempre utilizables.
 *
 * El rango se resuelve acá: con una ventana rápida se recalcula en cada carga
 * (para que "últimos 7 días" siga siendo relativo aunque el link sea viejo) y
 * sólo se respetan `desde`/`hasta` de la URL cuando el rango es personalizado.
 */
export function parsearFiltrosEstadisticas(
  searchParams: Record<string, string | undefined>
): FiltrosEstadisticasState {
  const crudo = searchParamsSchema.parse(searchParams);
  const porDefecto = obtenerRangoVentana(VENTANA_POR_DEFECTO)!;

  const rangoVentana = obtenerRangoVentana(crudo.ventana);
  const desde = rangoVentana?.desde ?? crudo.desde ?? porDefecto.desde;
  const hasta = rangoVentana?.hasta ?? crudo.hasta ?? porDefecto.hasta;

  return {
    vista: crudo.vista,
    atributo: crudo.atributo,
    limnigrafos: crudo.limnigrafos,
    ventana: crudo.ventana,
    desde,
    hasta,
    agrupar: crudo.agrupar,
  };
}

/**
 * Validación estricta para el formulario de filtros, al momento de aplicar.
 *
 * Concentra acá las comprobaciones que en el frontend legacy estaban repetidas en
 * tres handlers distintos.
 *
 * No se valida que el resumen tenga exactamente un limnígrafo: `limnigrafos` es la
 * selección compartida entre las tres vistas y el resumen consulta sólo el
 * primero. Exigir largo 1 haría fallar la validación por IDs que esa vista ni
 * siquiera usa.
 */
export const filtrosEstadisticasSchema = z
  .object({
    vista: z.enum(VISTAS),
    atributo: z.enum(ATRIBUTOS),
    limnigrafos: z.array(z.number().int().positive()).min(1, "Elegí al menos un limnígrafo."),
    ventana: z.enum(VENTANAS),
    desde: z.string().regex(FORMATO_FECHA, "Fecha de inicio inválida."),
    hasta: z.string().regex(FORMATO_FECHA, "Fecha de fin inválida."),
    agrupar: z.enum(AGRUPACIONES),
  })
  .superRefine((filtros, ctx) => {
    if (filtros.desde > filtros.hasta) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hasta"],
        message: "La fecha de inicio debe ser anterior a la de fin.",
      });
    }
  });

/**
 * Valida los filtros y devuelve los mensajes de error por campo.
 * Un objeto vacío significa que la consulta se puede aplicar.
 */
export function validarFiltrosEstadisticas(filtros: FiltrosEstadisticasState): Record<string, string> {
  const resultado = filtrosEstadisticasSchema.safeParse(filtros);
  if (resultado.success) return {};

  const errores: Record<string, string> = {};
  for (const issue of resultado.error.issues) {
    const campo = String(issue.path[0] ?? "general");
    errores[campo] ??= issue.message;
  }
  return errores;
}

/**
 * Serializa los filtros a query string, omitiendo todo lo que coincide con el
 * valor por defecto para que la URL quede corta y legible.
 */
export function construirParamsEstadisticas(filtros: FiltrosEstadisticasState): URLSearchParams {
  const params = new URLSearchParams();

  if (filtros.vista !== VISTA_POR_DEFECTO) params.set("vista", filtros.vista);
  if (filtros.atributo !== ATRIBUTO_POR_DEFECTO) params.set("atributo", filtros.atributo);
  if (filtros.limnigrafos.length > 0) params.set("limnigrafos", filtros.limnigrafos.join(","));
  if (filtros.ventana !== VENTANA_POR_DEFECTO) params.set("ventana", filtros.ventana);

  // Sólo tiene sentido fijar el rango cuando lo eligió el usuario: con una ventana
  // rápida se recalcula en cada carga.
  if (filtros.ventana === "personalizado") {
    params.set("desde", filtros.desde);
    params.set("hasta", filtros.hasta);
  }

  if (filtros.vista === "resumen" && filtros.agrupar !== AGRUPACION_POR_DEFECTO) {
    params.set("agrupar", filtros.agrupar);
  }

  return params;
}
