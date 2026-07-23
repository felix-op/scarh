import { createHandler, getServerLimnigrafoConfiguracion, postServerLimnigrafoConfiguracion } from "@services";
import { configuracionPostSchema } from "@utils";

export const GET = createHandler({ action: getServerLimnigrafoConfiguracion });
export const POST = createHandler({ action: postServerLimnigrafoConfiguracion, schema: configuracionPostSchema });
