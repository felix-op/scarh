import { format, subDays } from "date-fns";
import { getServerMediciones, getServerLimnigrafos } from "@services";
import { TablaMediciones, type FiltrosMedicionesPagina } from "@components";

export interface MedicionesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function MedicionesPage({ searchParams }: MedicionesPageProps) {
  const params = await searchParams;

  const filtros: FiltrosMedicionesPagina = {
    limnigrafo: params.limnigrafo || "todos",
    fuente: params.fuente || "todas",
    desde: params.desde || format(subDays(new Date(), 7), "yyyy-MM-dd"),
    hasta: params.hasta || format(new Date(), "yyyy-MM-dd"),
    busqueda: params.busqueda || "",
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 50,
  };

  const [data, limnigrafosResponse] = await Promise.all([
    getServerMediciones({
      queryParams: {
        limnigrafo: filtros.limnigrafo !== "todos" ? filtros.limnigrafo : undefined,
        fuente: filtros.fuente !== "todas" ? filtros.fuente : undefined,
        fecha_desde: filtros.desde ? `${filtros.desde}T00:00:00` : undefined,
        fecha_hasta: filtros.hasta ? `${filtros.hasta}T23:59:59` : undefined,
        search: filtros.busqueda || undefined,
        page: filtros.page,
        limit: filtros.limit,
      },
    }),
    getServerLimnigrafos({ queryParams: { limit: 1000, page: 1 } }),
  ]);

  const limnigrafosOpciones = limnigrafosResponse.results.map((limnigrafo) => ({
    label: limnigrafo.codigo,
    value: String(limnigrafo.id),
  }));

  return (
    <TablaMediciones
      data={data}
      limnigrafos={limnigrafosResponse.results}
      limnigrafosOpciones={limnigrafosOpciones}
      filtros={filtros}
    />
  );
}
