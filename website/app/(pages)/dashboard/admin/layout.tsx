import { redirect } from "next/navigation";
import { auth } from "@auth";
import { ROLES, esAdmin, puedeVer } from "@utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const usuario = session.user;
  const tienePermisoAdmin = puedeVer(usuario, [
    ROLES.USUARIOS_VISUALIZAR,
    ROLES.HISTORIAL_VISUALIZAR,
    ROLES.ADMINISTRACION,
  ]);

  if (!esAdmin(usuario) && !tienePermisoAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
