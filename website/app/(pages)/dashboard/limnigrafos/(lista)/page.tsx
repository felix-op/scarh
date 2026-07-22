import { auth } from "@auth";
import { getServerLimnigrafos } from "@services";
import { ROLES } from "@utils";
import { TablaLimnigrafos } from "@components";

export default async function LimnigrafosPage() {
  const session = await auth();
  const roles = session?.user?.roles || [];
  const puedeEditar = roles.includes("administracion") || roles.includes(ROLES.LIMNIGRAFOS_EDITAR);

  const data = await getServerLimnigrafos({ queryParams: { limit: 9999 } });

  return <TablaLimnigrafos initialData={data} puedeEditar={puedeEditar} />;
}
