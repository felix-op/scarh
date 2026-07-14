import { auth } from "@auth";

export default async function UsuariosPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <h1>Bienvenido a usuarios, {session?.user?.first_name || session?.user?.username}</h1>
    </div>
  );
}
