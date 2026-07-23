import { createHandler, postServerBulkImportMediciones } from "@services";

export const POST = createHandler({ action: postServerBulkImportMediciones });
