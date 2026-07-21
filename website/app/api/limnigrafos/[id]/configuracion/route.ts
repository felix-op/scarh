import { createHandler, getServerLimnigrafoConfiguracion, patchServerLimnigrafoConfiguracion } from "@services";
import { configuracionPatchSchema } from "@utils";

export const GET = createHandler({ action: getServerLimnigrafoConfiguracion });
export const PATCH = createHandler({ action: patchServerLimnigrafoConfiguracion, schema: configuracionPatchSchema });
