import { auth } from "@auth";
import {
  Alert,
  AutoRefresco,
  Saludo,
  GrillaLimnigrafos,
  LayoutBase,
  LineaTiempoAcciones,
  ResumenInstalacion,
} from "@components";
import { getSSREstadisticasDashboard } from "@services";
import { obtenerSaludo } from "@utils";
import { ApiError, type DashboardResponse } from "@models";

export default async function DashboardPage() {
  const session = await auth();
  const nombre = session?.user?.first_name || session?.user?.username;

  // Momento en que se resolvieron los datos, para el "actualizado hace…".
  //
  // La regla de pureza apunta a componentes que se re-renderizan, donde `Date.now()`
  // daría un valor distinto en cada pasada. Este es un Server Component asíncrono:
  // corre una vez por request y su resultado viaja al cliente ya serializado, que es
  // precisamente lo que hace confiable la marca de tiempo.
  // eslint-disable-next-line react-hooks/purity
  const generadoEn = Date.now();

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
      titulo={
        nombre ? <Saludo inicial={obtenerSaludo(nombre, new Date(generadoEn), generadoEn)} /> : "Inicio"
      }
      subtitulo="Estado de la red de limnígrafos y actividad reciente del sistema."
      acciones={<AutoRefresco generadoEn={generadoEn} />}
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
            <section className="xl:col-span-2">
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
