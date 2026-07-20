import { createHandler, putServerUsuarioRoles } from "@services";
import { usuarioRolesSchema } from "@utils";

export const PUT = createHandler({ action: putServerUsuarioRoles, schema: usuarioRolesSchema });
