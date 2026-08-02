import { auth } from "@auth";
import {
  Alert,
  GrillaLimnigrafos,
  LayoutBase,
  LineaTiempoAcciones,
  ResumenInstalacion,
} from "@components";
import { getSSREstadisticasDashboard } from "@services";
import { ApiError, type DashboardResponse } from "@models";

export default async function DashboardPage() {
  const session = await auth();
  const nombre = session?.user?.first_name || session?.user?.username;

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
    <LayoutBase
      titulo={nombre ? `Hola, ${nombre}` : "Inicio"}
      subtitulo="Estado de la red de limnígrafos y actividad reciente del sistema."
    >
      {error && (
        <Alert variant="error" title="No se pudo cargar el tablero">
          {error}
        </Alert>
      )}

      {datos && (
        <div className="flex flex-col gap-6">
          <ResumenInstalacion resumen={datos.resumen} enLinea={enLinea} />

          {/*
            Los dispositivos son el contenido principal y la actividad es apoyo, así
            que la grilla se lleva dos tercios. En pantallas chicas se apilan, con los
            dispositivos primero.
          */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="flex flex-col gap-3 xl:col-span-2">
              <h2 className="text-sm font-semibold text-foreground-title">Dispositivos</h2>
              <GrillaLimnigrafos limnigrafos={datos.limnigrafos} />
            </section>

            <aside className="xl:col-span-1">
              <LineaTiempoAcciones acciones={datos.ultimas_acciones} />
            </aside>
          </div>
        </div>
      )}
    </LayoutBase>
  );
}
