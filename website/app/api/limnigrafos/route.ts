import { createHandler, getServerLimnigrafos, postServerLimnigrafo } from "@services";
import { limnigrafoPostSchema } from "@utils";

export const GET = createHandler({ action: getServerLimnigrafos });
export const POST = createHandler({ action: postServerLimnigrafo, schema: limnigrafoPostSchema });
