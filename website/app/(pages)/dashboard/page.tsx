import {
  Alert,
  AutoRefresco,
  GrillaLimnigrafos,
  LayoutBase,
  LineaTiempoAcciones,
  ResumenDispositivos,
  ResumenMediciones,
  ResumenOrigenCargas,
} from "@components";
import { getSSREstadisticasDashboard } from "@services";
import { ApiError, type DashboardResponse } from "@models";

export default async function DashboardPage() {
  let datos: DashboardResponse | null = null;
  let error: string | undefined;

  try {
    datos = await getSSREstadisticasDashboard();
  } catch (excepcion) {
    // Igual que en estadísticas: sólo se degrada el error de negocio. Todo lo demás
    // se propaga, en particular el `redirect("/logout")` que `RequestSSR` lanza ante
    // un 401 y que atraparlo dejaría al usuario sin salida.
    if (!(excepcion instanceof ApiError)) throw excepcion;
    error = excepcion.descripcionUsuario;
  }

  const enLinea =
    datos?.limnigrafos.filter((limnigrafo) => limnigrafo.estado_conexion === "en_linea").length ?? 0;

  return (
    <LayoutBase>
      <AutoRefresco />
      {error && (
        <Alert variant="error" title="No se pudo cargar el tablero">
          {error}
        </Alert>
      )}

      {datos && (
        <div className="grid grid-cols-1 gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-5 xl:grid-rows-5">
          <ResumenDispositivos
            resumen={datos.resumen}
            enLinea={enLinea}
            className="xl:col-start-1 xl:row-start-1"
          />
          <ResumenMediciones resumen={datos.resumen} className="xl:col-start-1 xl:row-start-2" />
          <ResumenOrigenCargas
            resumen={datos.resumen}
            className="xl:col-span-2 xl:col-start-2 xl:row-span-2 xl:row-start-1"
          />
          <GrillaLimnigrafos
            limnigrafos={datos.limnigrafos}
            className="xl:col-span-3 xl:col-start-1 xl:row-span-3 xl:row-start-3"
          />
          <LineaTiempoAcciones
            acciones={datos.ultimas_acciones}
            className="xl:col-span-2 xl:col-start-4 xl:row-span-5 xl:row-start-1"
          />
        </div>
      )}
    </LayoutBase>
  );
}
