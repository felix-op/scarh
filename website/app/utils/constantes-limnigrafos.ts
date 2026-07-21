/**
 * Constantes de dominio de los limnígrafos: opciones de formularios/filtros y el mapa
 * de estado → estilo del chip.
 */

export const opcionesTipoComunicacion = [
  { label: "Internet 2G", value: "internet-https-2G" },
  { label: "Internet 3G", value: "internet-https-3G" },
  { label: "Internet 4G", value: "internet-https-4G" },
  { label: "Internet 5G", value: "internet-https-5G" },
  { label: "USB", value: "fisico-usb" },
  { label: "Mensajes SMS", value: "mensajes-sms" },
  { label: "Correos SMTP", value: "correos-smtp" },
];

export const opcionesMemoria = [
  { label: "B", value: "B" },
  { label: "KB", value: "KB" },
  { label: "MB", value: "MB" },
  { label: "GB", value: "GB" },
];

/** Opciones del filtro de estado (incluye "Todos"). */
export const opcionesEstado = [
  { label: "Todos", value: "todos" },
  { label: "Normal", value: "normal" },
  { label: "Advertencia", value: "advertencia" },
  { label: "Peligro", value: "peligro" },
  { label: "Fuera de rango", value: "fuera_de_rango" },
];

/** Opciones del filtro "tiempo desde el último dato". */
export const opcionesTiempoUltimoDato = [
  { label: "Cualquiera", value: "todos" },
  { label: "Última hora", value: "hora" },
  { label: "Últimas 24 h", value: "dia" },
  { label: "Última semana", value: "semana" },
  { label: "Más de una semana", value: "mas_semana" },
];

export type EstadoLimnigrafoVariant = "success" | "warn" | "error" | "none" | "info";

/** Mapa de estado del backend a etiqueta + variante del `Chip`. */
export const ESTADO_LIMNIGRAFO: Record<string, { label: string; variant: EstadoLimnigrafoVariant }> = {
  normal: { label: "Normal", variant: "success" },
  advertencia: { label: "Advertencia", variant: "warn" },
  peligro: { label: "Peligro", variant: "error" },
  fuera_de_rango: { label: "Fuera de rango", variant: "none" },
};
