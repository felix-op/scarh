import { format, subDays } from "date-fns";
import { getServerHistorial, getServerUsuarios } from "@services";
import { TablaHistorial, type FiltrosHistorialPagina } from "@components";
import { obtenerFechasVentana } from "@utils";

export interface HistorialPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function HistorialPage({ searchParams }: HistorialPageProps) {
  const params = await searchParams;

  const ventana = params.ventana || "semana";
  const fechasVentana = obtenerFechasVentana(ventana) || {
    desde: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    hasta: format(new Date(), "yyyy-MM-dd"),
  };

  const filtros: FiltrosHistorialPagina = {
    tipo: params.type || "todas",
    entidad: params.model || "todas",
    usuario: params.usuario || "todos",
    ventana,
    desde: params.desde !== undefined ? params.desde : fechasVentana.desde,
    hasta: params.hasta !== undefined ? params.hasta : fechasVentana.hasta,
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 50,
  };

  const [data, usuariosResponse] = await Promise.all([
    getServerHistorial({
      queryParams: {
        type: filtros.tipo !== "todas" ? filtros.tipo : undefined,
        model: filtros.entidad !== "todas" ? filtros.entidad : undefined,
        usuario: filtros.usuario !== "todos" ? filtros.usuario : undefined,
        desde: filtros.desde || undefined,
        hasta: filtros.hasta || undefined,
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
