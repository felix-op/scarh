import { NextResponse } from "next/server";
import { getServerRutaAccesoDescargar } from "@services";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Proxy de descarga del archivo de traza (GPX/KML). Devuelve el blob de Django tal cual,
 * marcándolo como adjunto para forzar la descarga en el navegador.
 */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const blob = await getServerRutaAccesoDescargar({ params: { id } });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="ruta-${id}"`,
    },
  });
}
