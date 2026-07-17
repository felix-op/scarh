import { getUsuario } from "@/services/api/usuarios";
import { FormularioEditarUsuario } from "@/components/usuarios/formulario-editar-usuario";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let usuario;
  try {
    usuario = await getUsuario(id);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <h2 className="text-2xl font-bold text-error">Error al cargar usuario</h2>
        <p className="text-foreground-secondary">
          No se pudo encontrar el usuario o hubo un error de conexión.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2 mb-4 text-center">
        <h1 className="text-3xl font-bold text-foreground-title">Editar Usuario</h1>
        <p className="text-foreground-secondary">
          Modifique los datos personales y de acceso del usuario.
        </p>
      </div>

      <FormularioEditarUsuario usuario={usuario} />
    </div>
  );
}
