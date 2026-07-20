import { createHandler, getServerUsuario, putServerUsuario, deleteServerUsuario } from "@services";
import { usuarioPutSchema } from "@utils";

export const GET = createHandler({ action: getServerUsuario });
export const PUT = createHandler({ action: putServerUsuario, schema: usuarioPutSchema });
export const DELETE = createHandler({ action: deleteServerUsuario });
