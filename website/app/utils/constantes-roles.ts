/**
 * Catálogo fijo de roles/permisos del sistema.
 * @property {string} ADMINISTRACION Acceso total a todas las funcionalidades de administración.
 * @property {string} MAPA_VISUALIZAR Permite visualizar el mapa.
 * @property {string} MAPA_EDITAR Permite editar configuraciones relacionadas al mapa.
 * @property {string} LIMNIGRAFOS_VISUALIZAR Permite visualizar limnígrafos.
 * @property {string} LIMNIGRAFOS_EDITAR Permite crear, editar y eliminar limnígrafos.
 * @property {string} MEDICIONES_VISUALIZAR Permite visualizar mediciones.
 * @property {string} MEDICIONES_EDITAR Permite crear mediciones manuales.
 * @property {string} USUARIOS_VISUALIZAR Permite visualizar usuarios.
 * @property {string} USUARIOS_EDITAR Permite crear, editar y eliminar usuarios.
 * @property {string} HISTORIAL_VISUALIZAR Permite visualizar historial de acciones.
 * @property {string} UBICACIONES_VISUALIZAR Permite visualizar ubicaciones.
 * @property {string} UBICACIONES_EDITAR Permite crear, editar y eliminar ubicaciones.
 * @property {string} ESTADISTICAS_VISUALIZAR Permite consultar estadísticas no persistidas.
 */
export const ROLES = {
  ADMINISTRACION: "administracion",
  MAPA_VISUALIZAR: "mapa-visualizar",
  MAPA_EDITAR: "mapa-editar",
  LIMNIGRAFOS_VISUALIZAR: "limnigrafos-visualizar",
  LIMNIGRAFOS_EDITAR: "limnigrafos-editar",
  MEDICIONES_VISUALIZAR: "mediciones-visualizar",
  MEDICIONES_EDITAR: "mediciones-editar",
  USUARIOS_VISUALIZAR: "usuarios-visualizar",
  USUARIOS_EDITAR: "usuarios-editar",
  HISTORIAL_VISUALIZAR: "historial-visualizar",
  UBICACIONES_VISUALIZAR: "ubicaciones-visualizar",
  UBICACIONES_EDITAR: "ubicaciones-editar",
  ESTADISTICAS_VISUALIZAR: "estadisticas-visualizar",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];
