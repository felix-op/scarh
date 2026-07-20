import Link from "next/link";
import { BotonVolver } from "@components";

export interface HistorialDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function HistorialDetallePage({ params }: HistorialDetallePageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground-title">Detalle del Evento #{id}</h1>
          <p className="text-foreground-secondary">
            Esta página está en construcción. Próximamente mostrará el detalle completo de este evento de auditoría.
          </p>
        </div>
        <Link href="/dashboard/admin/historial" className="no-underline">
          <BotonVolver content="Volver al historial" />
        </Link>
      </div>
    </div>
  );
}
