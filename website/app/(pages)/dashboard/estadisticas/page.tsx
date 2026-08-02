import { PantallaEstadisticas } from "@components";
import { getSSREstadisticasTabla, getServerLimnigrafos } from "@services";
import { limitesDelRango, parsearFiltrosEstadisticas } from "@utils";
import { ApiError, type EstadisticaTablaResponse } from "@models";

export interface EstadisticasPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function EstadisticasPage({ searchParams }: EstadisticasPageProps) {
  const filtros = parsearFiltrosEstadisticas(await searchParams);

  const limnigrafosResponse = await getServerLimnigrafos({ queryParams: { limit: 1000, page: 1 } });
  const limnigrafos = limnigrafosResponse.results.map((limnigrafo) => ({
    id: limnigrafo.id,
    codigo: limnigrafo.codigo,
    descripcion: limnigrafo.descripcion ?? undefined,
  }));

  // La primera visita no trae limnígrafos en la URL: se arranca con todos, que es
  // el caso de uso de la vista comparativa.
  const seleccionados =
    filtros.limnigrafos.length > 0 ? filtros.limnigrafos : limnigrafos.map((limnigrafo) => limnigrafo.id);

  // El resumen por período compara períodos de un mismo sensor y el endpoint
  // rechaza varios, así que se consulta sólo el activo.
  const consultados = filtros.vista === "resumen" ? seleccionados.slice(0, 1) : seleccionados;

  let datos: EstadisticaTablaResponse | null = null;
  let errorCarga: string | undefined;

  if (filtros.vista !== "graficos" && consultados.length > 0) {
    try {
      datos = await getSSREstadisticasTabla({
        limnigrafos: consultados.join(","),
        atributo: filtros.atributo,
        agrupar_por: filtros.vista === "resumen" ? filtros.agrupar : "dispositivo",
        ...limitesDelRango(filtros.desde, filtros.hasta),
      });
    } catch (error) {
      // Sólo se degrada el error de negocio, que casi siempre viene de una
      // combinación de filtros que el backend rechaza: eso se corrige cambiando un
      // filtro, no recargando la pantalla.
      //
      // Todo lo demás se deja propagar hacia `error.tsx`. En particular `RequestSSR`
      // hace `redirect("/logout")` ante un 401, y `redirect` de Next funciona
      // lanzando una excepción: atraparla dejaría al usuario con la sesión vencida
      // mirando un cartel, sin forma de volver a entrar.
      if (!(error instanceof ApiError)) throw error;
      errorCarga = error.descripcionUsuario;
    }
  }

  return (
    <PantallaEstadisticas
      filtros={{ ...filtros, limnigrafos: seleccionados }}
      limnigrafos={limnigrafos}
      datos={datos}
      errorCarga={errorCarga}
    />
  );
}
