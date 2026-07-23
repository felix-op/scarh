export {
  getServerAlertas,
  getServerAlerta,
  putServerAlerta,
  patchServerAlerta
} from "./next-server/alertas";

export {
  postServerAuthRecuperarPasswordNueva,
  postServerAuthRecuperarPasswordSolicitar,
  postServerAuthRecuperarPasswordValidar,
} from "./next-server/auth";

export {
  getServerEstadistica
} from "./next-server/estadistica";

export {
  getServerHistorial,
  getServerHistorialDetalle
} from "./next-server/historial";

export {
  getServerLimnigrafos,
  postServerLimnigrafo,
  getServerLimnigrafo,
  putServerLimnigrafo,
  patchServerLimnigrafo,
  deleteServerLimnigrafo,
  getServerLimnigrafoConfiguracion,
  putServerLimnigrafoConfiguracion,
  postServerLimnigrafoConfiguracion,
  postServerLimnigrafoGenerateKey
} from "./next-server/limnigrafos";

export {
  getServerRutasAcceso,
  postServerRutaAcceso,
  patchServerRutaAcceso,
  deleteServerRutaAcceso,
  getServerRutaAccesoDescargar
} from "./next-server/rutas-acceso";

export {
  getServerMediciones,
  postServerMedicion,
  getServerMedicion,
  postServerValidateImportMediciones,
  postServerBulkImportMediciones
} from "./next-server/mediciones";

export {
  getServerUbicaciones,
  postServerUbicacion,
  getServerUbicacion,
  putServerUbicacion,
  patchServerUbicacion,
  deleteServerUbicacion
} from "./next-server/ubicacion";

export {
  getServerUsuarios,
  postServerUsuario,
  getServerUsuario,
  putServerUsuario,
  patchServerUsuario,
  deleteServerUsuario,
  postServerUsuarioCambiarPassword,
  putServerUsuarioRoles
} from "./next-server/usuarios";
