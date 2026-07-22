/**
 * Opciones de filtro para la fuente de una medición.
 * Refleja `Medicion.fuente` choices del backend.
 */
export const opcionesFuenteMedicion = [
  { label: "Manual", value: "manual" },
  { label: "Automático", value: "automatico" },
  { label: "Importación CSV", value: "import_csv" },
  { label: "Importación JSON", value: "import_json" },
];

/**
 * Opciones de ventana de tiempo para el filtro de mediciones.
 */
export const opcionesVentanaTiempo = [
  { label: "Última hora", value: "hora" },
  { label: "Últimas 24 horas", value: "dia" },
  { label: "Última semana", value: "semana" },
  { label: "Más de una semana", value: "mas_semana" },
  { label: "Rango personalizado", value: "personalizado" },
];

