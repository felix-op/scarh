import { getServerLimnigrafo } from "@services";
import { LayoutBase } from "@components";
import { FormEditarLimnigrafo } from "@/components/limnigrafos/form-editar-limnigrafo";

export default async function EditarLimnigrafoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limnigrafo = await getServerLimnigrafo({ params: { id } });

  return (
    <LayoutBase
      titulo="Editar limnígrafo"
      subtitulo={`Modificá los datos, el mantenimiento y las especificaciones técnicas del limnígrafo ${limnigrafo.codigo}.`}
    >
      <FormEditarLimnigrafo limnigrafo={limnigrafo} />
    </LayoutBase>
  );
}
