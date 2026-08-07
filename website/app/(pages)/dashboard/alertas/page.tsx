import { getServerAlertas, getServerLimnigrafos } from "@services";
import { TablaAlertas, FILTROS_ALERTAS_POR_DEFECTO, type FiltrosAlertasPagina } from "@components";

export interface AlertasPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

/** `lectura` y `condicion` son de la UI; el backend espera dos booleanos distintos. */
function booleanoDeSelector(valor: string, valorVerdadero: string, valorFalso: string) {
  if (valor === valorVerdadero) return true;
  if (valor === valorFalso) return false;
  return undefined;
}

export default async function AlertasPage({ searchParams }: AlertasPageProps) {
  const params = await searchParams;

  const filtros: FiltrosAlertasPagina = {
    estado: params.estado || FILTROS_ALERTAS_POR_DEFECTO.estado,
    limnigrafo: params.limnigrafo || FILTROS_ALERTAS_POR_DEFECTO.limnigrafo,
    tipo: params.tipo || FILTROS_ALERTAS_POR_DEFECTO.tipo,
    lectura: params.lectura || FILTROS_ALERTAS_POR_DEFECTO.lectura,
    condicion: params.condicion || FILTROS_ALERTAS_POR_DEFECTO.condicion,
    ordering: params.ordering || FILTROS_ALERTAS_POR_DEFECTO.ordering,
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 10,
  };

  const [data, limnigrafosResponse] = await Promise.all([
    getServerAlertas({
      queryParams: {
        estado: filtros.estado !== "todos" ? filtros.estado : undefined,
        limnigrafo: filtros.limnigrafo !== "todos" ? filtros.limnigrafo : undefined,
        tipo: filtros.tipo !== "todos" ? filtros.tipo : undefined,
        leida: booleanoDeSelector(filtros.lectura, "leidas", "no_leidas"),
        activa: booleanoDeSelector(filtros.condicion, "vigentes", "cerradas"),
        ordering: filtros.ordering,
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

  return <TablaAlertas data={data} limnigrafosOpciones={limnigrafosOpciones} filtros={filtros} />;
}
