import { auth } from "@auth";
import { getServerLimnigrafo } from "@services";
import { ROLES } from "@utils";
import { DetalleLimnigrafo } from "@/components/limnigrafos/detalle-limnigrafo";

export default async function DatosLimnigrafoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const roles = session?.user?.roles || [];
  const puedeEditar = roles.includes("administracion") || roles.includes(ROLES.LIMNIGRAFOS_EDITAR);

  const limnigrafo = await getServerLimnigrafo({ params: { id } });

  return <DetalleLimnigrafo limnigrafo={limnigrafo} puedeEditar={puedeEditar} />;
}
