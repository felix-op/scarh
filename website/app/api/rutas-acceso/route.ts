import { createHandler, getServerRutasAcceso, postServerRutaAcceso } from "@services";

export const GET = createHandler({ action: getServerRutasAcceso });
// POST es multipart/form-data (archivo GPX/KML): createHandler reenvía el FormData tal cual.
export const POST = createHandler({ action: postServerRutaAcceso });
