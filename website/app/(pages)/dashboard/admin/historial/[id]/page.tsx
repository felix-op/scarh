import { LayoutBase } from "@components";

export interface HistorialDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function HistorialDetallePage({ params }: HistorialDetallePageProps) {
  const { id } = await params;

  return (
    <LayoutBase
      titulo={`Detalle del Evento #${id}`}
      subtitulo="Esta página está en construcción. Próximamente mostrará el detalle completo de este evento de auditoría."
      volver
    />
  );
}
