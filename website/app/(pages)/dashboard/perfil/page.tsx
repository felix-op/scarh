import { LayoutBase, PreferenciasLocales, TarjetaPerfil } from "@components";
import { getSSRPerfil } from "@services";

export default async function PerfilPage() {
  const perfil = await getSSRPerfil();

  return (
    <LayoutBase
      titulo="Mi perfil"
      subtitulo="Tu información personal y las preferencias de este navegador."
    >
      <div className="flex flex-col gap-6">
        <TarjetaPerfil perfil={perfil} />
        <PreferenciasLocales />
      </div>
    </LayoutBase>
  );
}
