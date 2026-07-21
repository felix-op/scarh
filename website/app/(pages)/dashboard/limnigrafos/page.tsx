import { auth } from "@auth";
import { getServerLimnigrafos } from "@services";
import { ROLES } from "@utils";
import { TablaLimnigrafos } from "@/components/limnigrafos/tabla-limnigrafos";

export default async function LimnigrafosPage() {
  const session = await auth();
  const roles = session?.user?.roles || [];
  const puedeEditar = roles.includes("administracion") || roles.includes(ROLES.LIMNIGRAFOS_EDITAR);

  const data = await getServerLimnigrafos({ queryParams: { limit: 9999 } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Gestión de Limnígrafos</h1>
        <p className="text-foreground-secondary">
          Administre los limnígrafos del sistema, su configuración y sus rutas de acceso.
        </p>
      </div>

      <TablaLimnigrafos initialData={data} puedeEditar={puedeEditar} />
    </div>
  );
}
