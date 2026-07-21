import { getServerLimnigrafo } from "@services";
import { FormEditarLimnigrafo } from "@/components/limnigrafos/form-editar-limnigrafo";

export default async function EditarLimnigrafoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limnigrafo = await getServerLimnigrafo({ params: { id } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground-title">Editar limnígrafo</h1>
        <p className="text-foreground-secondary">
          Modificá los datos, el mantenimiento y las especificaciones técnicas del limnígrafo {limnigrafo.codigo}.
        </p>
      </div>

      <FormEditarLimnigrafo limnigrafo={limnigrafo} />
    </div>
  );
}
