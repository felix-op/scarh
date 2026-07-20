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
  const usuarios = response.results || [];

  // 3. Preparar opciones de roles para el Select de filtro
  const rolesOpciones = opcionesRoles
    .flatMap(e => e.roles)
    .filter(r => r.value !== "usuarios-editar") // Ocultar este rol segun los requerimientos
    .map(r => ({ label: r.label, value: r.value }));


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Administración de Usuarios</h1>
        <p className="text-foreground-secondary">
          Gestione los usuarios del sistema, sus datos y los roles asignados para el control de permisos.
        </p>
      </div>

      <TablaUsuarios 
        usuarios={usuarios} 
        rolesOpciones={rolesOpciones}
        esAdministrador={esAdministrador}
      />

      <Alert variant="exito" title="Proceso completado" className="">
        Se actualizo el usuario con éxito
      </Alert>

      <Alert variant="error" title="Error 409">
        No se pudo eliminar el usuario, tiene historial asociado
      </Alert>
      <Alert variant="alerta" title="¡Atención!">
        No tiene permisos para editar en esta página
      </Alert>
      <Alert variant="info" title="Filtros">
        Recuerde que puede utilizar diferentes filtros
      </Alert>
    </div>
  );
}
