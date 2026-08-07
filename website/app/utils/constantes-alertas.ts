import type { EstadoEnum, TipoAlerta } from "@models";

// Los union types se repiten en vez de importarse de `@components` (donde viven como
// `ChipEstadoVariante` y `CardStatusProps["status"]`): `utils` es una hoja del grafo de
// imports y traer el barril de componentes acá arma un ciclo. Mismo criterio que
// `limnigrafos.estado.ts`.

/** Espejo de `ChipEstadoVariante` de `components/ui/chip-estado.tsx`. */
type VarianteEstado = "success" | "warn" | "error" | "neutral";

/** Espejo de `CardStatusProps["status"]` de `components/ui/cards.tsx`. */
type EstadoTarjeta = "success" | "error" | "warning" | "info";

/** Textos de `UsuarioNotificacion.ESTADOS_CHOICES`, en femenino porque acompañan a "alerta". */
export const ETIQUETAS_ESTADO_ALERTA: Record<EstadoEnum, string> = {
  nuevo: "Nueva",
  leido: "Leída",
  solucionado: "Solucionada",
};

/** Textos de `Alerta.TIPOS_CHOICES`. */
export const ETIQUETAS_TIPO_ALERTA: Record<TipoAlerta, string> = {
  fuera_rango_medicion: "Fuera de rango de medición",
  advertencia_limnigrafo: "Advertencia de limnígrafo",
  peligro_limnigrafo: "Peligro de limnígrafo",
  sin_conexion_limnigrafo: "Sin conexión del limnígrafo",
};

/** Color del punto del `ChipEstado` según la lectura de la notificación. */
export function varianteEstadoAlerta(estado: EstadoEnum): VarianteEstado {
  if (estado === "nuevo") return "warn";
  if (estado === "solucionado") return "success";
  return "neutral";
}

/**
 * Color de la barra lateral de `CardStatus` según la gravedad del tipo.
 * Es lo único que distingue de un vistazo una crecida de una batería baja.
 */
export function estadoTarjetaPorTipo(tipo: TipoAlerta): EstadoTarjeta {
  if (tipo === "peligro_limnigrafo" || tipo === "sin_conexion_limnigrafo") return "error";
  return "warning";
}

export const opcionesEstadoAlerta = [
  { label: "Nueva", value: "nuevo" },
  { label: "Leída", value: "leido" },
  { label: "Solucionada", value: "solucionado" },
];

export const opcionesTipoAlerta = (Object.keys(ETIQUETAS_TIPO_ALERTA) as TipoAlerta[]).map((tipo) => ({
  label: ETIQUETAS_TIPO_ALERTA[tipo],
  value: tipo,
}));

export const opcionesLectura = [
  { label: "Todas", value: "todas" },
  { label: "Sólo no leídas", value: "no_leidas" },
  { label: "Sólo leídas", value: "leidas" },
];

/** Vigencia de la condición que disparó la alerta (`Alerta.condicion_activa`). */
export const opcionesCondicionAlerta = [
  { label: "Todas", value: "todas" },
  { label: "Sólo vigentes", value: "vigentes" },
  { label: "Sólo cerradas", value: "cerradas" },
];

export const opcionesOrdenAlertas = [
  { label: "Más recientes", value: "-fecha_hora" },
  { label: "Más antiguas", value: "fecha_hora" },
];
