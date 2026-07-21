import { createHandler, patchServerRutaAcceso, deleteServerRutaAcceso } from "@services";

// PATCH es multipart/form-data: createHandler reenvía el FormData tal cual.
export const PATCH = createHandler({ action: patchServerRutaAcceso });
export const DELETE = createHandler({ action: deleteServerRutaAcceso });
