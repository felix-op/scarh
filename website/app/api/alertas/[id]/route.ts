import { createHandler, getServerAlerta, putServerAlerta, patchServerAlerta } from "@services";

export const GET = createHandler({ action: getServerAlerta });
export const PUT = createHandler({ action: putServerAlerta });
export const PATCH = createHandler({ action: patchServerAlerta });
