import Link from "next/link";
import { Card, RenderServerResponse, BotonVolver } from "@components";

// Importaciones de los endpoints generados
import { 
  getServerAlertas,
  getServerEstadistica,
  getServerHistorial,
  getServerHola,
  getServerLimnigrafos,
  getServerMediciones,
  getServerUbicaciones,
  getServerUsuarios
} from "@services";

export default function DocumentacionEndpointsPage() {
  const apiUrl = process.env.API_URL || "http://localhost:8000";
  const swaggerUrl = `${apiUrl}/docs`;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground-title">
            Recursos Disponibles (Endpoints GET)
          </h1>
          <p className="text-foreground-secondary">
            Ejemplos interactivos para probar cada uno de los endpoints de la API
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Alertas</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /alertas/</p>
          <RenderServerResponse title="getServerAlertas()" action={getServerAlertas} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Estadística</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /estadistica/</p>
          <RenderServerResponse title="getServerEstadistica()" action={getServerEstadistica} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Historial</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /historial/</p>
          <RenderServerResponse title="getServerHistorial()" action={getServerHistorial} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Hola</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /hola/</p>
          <RenderServerResponse title="getServerHola()" action={getServerHola} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Limnígrafos</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /limnigrafos/</p>
          <RenderServerResponse title="getServerLimnigrafos()" action={getServerLimnigrafos} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Mediciones</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /medicion/</p>
          <RenderServerResponse title="getServerMediciones()" action={getServerMediciones} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Ubicación</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /ubicacion/</p>
          <RenderServerResponse title="getServerUbicaciones()" action={getServerUbicaciones} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Usuarios</h2>
          <p className="text-foreground-secondary text-sm mb-4">GET /usuarios/</p>
          <RenderServerResponse title="getServerUsuarios()" action={getServerUsuarios} swaggerUrl={swaggerUrl} />
        </div>
      </Card>

    </div>
  );
}
