import Link from "next/link";
import { auth } from "@auth";
import { IconifyIcon } from "@components";
import { BotonVolverInicio } from "./boton-volver-inicio";

export default async function NoAutorizadoPage() {
  const session = await auth();
  const haySesion = !!session?.user;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <IconifyIcon variant="accesoDenegado" className="text-6xl text-error" />

      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground-title">No estás autorizado</h1>
        <p className="text-foreground-secondary">
          No tenés los permisos necesarios para acceder a esta sección. Si creés que se trata de
          un error, comunicate con administración.
        </p>
      </div>

      {haySesion ? (
        <BotonVolverInicio />
      ) : (
        <Link href="/login" className="text-sm text-primary underline">
          Volver a iniciar sesión
        </Link>
      )}
    </div>
  );
}
