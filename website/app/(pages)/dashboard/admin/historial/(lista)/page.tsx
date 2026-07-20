import { format, subDays } from "date-fns";
import { getServerHistorial, getServerUsuarios } from "@services";
import { TablaHistorial, type FiltrosHistorial } from "@components";

export interface HistorialPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function HistorialPage({ searchParams }: HistorialPageProps) {
  const params = await searchParams;

  const filtros: FiltrosHistorial = {
    tipo: params.type || "todas",
    entidad: params.model || "todas",
    usuario: params.usuario || "todos",
    desde: params.desde || format(subDays(new Date(), 1), "yyyy-MM-dd"),
    hasta: params.hasta || format(new Date(), "yyyy-MM-dd"),
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 50,
  };

  const [data, usuariosResponse] = await Promise.all([
    getServerHistorial({
      queryParams: {
        type: filtros.tipo !== "todas" ? filtros.tipo : undefined,
        model: filtros.entidad !== "todas" ? filtros.entidad : undefined,
        usuario: filtros.usuario !== "todos" ? filtros.usuario : undefined,
        desde: filtros.desde,
        hasta: filtros.hasta,
        page: filtros.page,
        limit: filtros.limit,
      },
    }),
    getServerUsuarios({ queryParams: { limit: 9999 } }),
  ]);

  const usuariosOpciones = usuariosResponse.results.map((usuario) => ({
    label: usuario.nombre_usuario,
    value: String(usuario.id),
  }));

  return <TablaHistorial data={data} usuariosOpciones={usuariosOpciones} filtros={filtros} />;
}
