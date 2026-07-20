import { createHandler, getServerUsuarios, postServerUsuario } from "@services";
import { usuarioPostSchema } from "@utils";

export const GET = createHandler({ action: getServerUsuarios });
export const POST = createHandler({ action: postServerUsuario, schema: usuarioPostSchema });
