import { TablaUsuarios } from "@/components/usuarios/tabla-usuarios";
import { opcionesRoles } from "@utils";
import { auth } from "@auth";
import { getServerUsuarios } from "@services";
import Alert from "@/components/ui/alerts";
import { IconifyIcon } from "@/components";

export default async function UsuariosPage() {
  const session = await auth();
  const userRoles = session?.user?.roles || [];
  const esAdministrador = userRoles.includes("administracion");

  // 2. Traer todos los usuarios del backend usando limit alto para saltar paginación temporalmente
  // Esperamos que en un futuro el backend simplemente no pagine.
  const response = await getServerUsuarios({ queryParams: { limit: 9999 } });

  // 3. Preparar opciones de roles para el Select de filtro
  const rolesOpciones = opcionesRoles
    .flatMap(e => e.roles)
    .filter(r => r.value !== "usuarios-editar") // Ocultar este rol segun los requerimientos
    .map(r => ({ label: r.label, value: r.value }));


  return (
    <TablaUsuarios
      initialData={response}
      rolesOpciones={rolesOpciones}
      esAdministrador={esAdministrador}
    />
  );
}
