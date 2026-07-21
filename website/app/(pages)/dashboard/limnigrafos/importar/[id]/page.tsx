"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alerts";
import { BotonVolver } from "@/components/ui/botones";

export default function ImportarDatosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground-title">Importar datos</h1>
        <BotonVolver content="Volver" onClick={() => router.back()} />
      </div>

      <Alert variant="info" title="En construcción">
        La importación de datos del limnígrafo #{id} todavía no está disponible. Próximamente vas a poder cargar
        mediciones desde aquí.
      </Alert>
    </div>
  );
}
