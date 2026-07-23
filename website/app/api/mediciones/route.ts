import { createHandler, getServerMediciones } from "@services";

export const GET = createHandler({ action: getServerMediciones });
