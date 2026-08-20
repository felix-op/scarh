import { PantallaEstadisticas } from "@components";
import { getSSREstadisticasTabla, getSSRLimnigrafosCatalogo, getSSRMedicionSerie } from "@services";
import { limitesDelRango, parsearFiltrosEstadisticas } from "@utils";
import { ApiError, type EstadisticaTablaResponse, type MedicionSerieResponse } from "@models";

export interface EstadisticasPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const ERROR_CATALOGO = "No se pudo cargar el catálogo de limnígrafos. El filtro por dispositivo no está disponible.";

export default async function EstadisticasPage({ searchParams }: EstadisticasPageProps) {
  const filtros = parsearFiltrosEstadisticas(await searchParams);

  let limnigrafos: { id: number; codigo: string }[] = [];
  let errorCatalogo: string | undefined;

  try {
    limnigrafos = (await getSSRLimnigrafosCatalogo()).map((limnigrafo) => ({
      id: limnigrafo.id,
      codigo: limnigrafo.codigo,
    }));
  } catch {
    errorCatalogo = ERROR_CATALOGO;
  }

  // La primera visita no trae limnígrafos en la URL: se arranca con todos, que es
  // el caso de uso de la vista comparativa.
  const seleccionados =
    errorCatalogo !== undefined ? [] : filtros.limnigrafos.length > 0 ? filtros.limnigrafos : limnigrafos.map((limnigrafo) => limnigrafo.id);

  // El resumen por período compara períodos de un mismo sensor y el endpoint
  // rechaza varios, así que se consulta sólo el activo.
  const consultados = filtros.vista === "resumen" ? seleccionados.slice(0, 1) : seleccionados;

  let datos: EstadisticaTablaResponse | null = null;
  let serie: MedicionSerieResponse | null = null;
  let errorCarga: string | undefined;

  if (consultados.length > 0) {
    try {
      const rango = limitesDelRango(filtros.desde, filtros.hasta);

      // La vista de gráficos necesita las dos cosas: la serie temporal para dibujar y
      // la tabla para las tiras de resumen. Se pide la tabla y no se derivan los
      // números de las cubetas porque la mediana no se puede reconstruir a partir de
      // promedios, y porque así los dos lugares no pueden mostrar cifras distintas de
      // lo mismo.
      if (filtros.vista === "graficos") {
        [serie, datos] = await Promise.all([
          getSSRMedicionSerie({
            limnigrafos: consultados.join(","),
            atributo: filtros.atributo,
            max_puntos: 400,
            agrupar_siempre: filtros.agruparSiempre,
            ...rango,
          }),
          getSSREstadisticasTabla({
            limnigrafos: consultados.join(","),
            atributo: filtros.atributo,
            agrupar_por: "dispositivo",
            ...rango,
          }),
        ]);
      } else {
        datos = await getSSREstadisticasTabla({
          limnigrafos: consultados.join(","),
          atributo: filtros.atributo,
          agrupar_por: filtros.vista === "resumen" ? filtros.agrupar : "dispositivo",
          ...rango,
        });
      }
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
      serie={serie}
      errorCarga={errorCarga}
      errorCatalogo={errorCatalogo}
    />
  );
}
