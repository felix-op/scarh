/**
 * Opciones de filtro para el tipo de acción registrada en el historial de auditoría.
 * Refleja `Accion.TIPO_ACCION_CHOICES` del backend.
 */
export const opcionesTipoAccion = [
  { label: "Creación", value: "created" },
  { label: "Modificación", value: "modified" },
  { label: "Eliminación", value: "deleted" },
  { label: "Carga manual de datos", value: "manual_data_load" },
];

/**
 * Opciones de filtro para la entidad modificada en el historial de auditoría.
 * Refleja el `model_map` del filtro `model` en `HistorialViewSet`.
 */
export const opcionesEntidad = [
  { label: "Usuario", value: "usuario" },
  { label: "Limnígrafo", value: "limnigrafo" },
  { label: "Medición", value: "medicion" },
];
