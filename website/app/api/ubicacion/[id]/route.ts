import { createHandler, getServerUbicacion, patchServerUbicacion } from "@services";

export const GET = createHandler({ action: getServerUbicacion });
export const PATCH = createHandler({ action: patchServerUbicacion });
