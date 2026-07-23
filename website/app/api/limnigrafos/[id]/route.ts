import { createHandler, getServerLimnigrafo, putServerLimnigrafo, patchServerLimnigrafo, deleteServerLimnigrafo } from "@services";
import { limnigrafoPutSchema } from "@utils";

export const GET = createHandler({ action: getServerLimnigrafo });
export const PUT = createHandler({ action: putServerLimnigrafo, schema: limnigrafoPutSchema });
export const PATCH = createHandler({ action: patchServerLimnigrafo });
export const DELETE = createHandler({ action: deleteServerLimnigrafo });
