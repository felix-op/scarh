"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  TablaConAccionesPaginada,
  ActionConfig,
  TableColumn,
  Chip,
  ChipVariant,
  BotonIcono,
  VentanaInfoUsuario,
} from "@components";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../shadcn/tooltip";
import { RequestClient, useMensajes } from "@services";
import { opcionesTipoAccion, obtenerFechasVentana } from "@utils";
import type { HistorialResponse, PaginatedHistorialResponse, UsuarioResponse, PaginatedResponse } from "@models";
import { FiltrosHistorial, type HistorialFiltrosState } from "./filtros-historial";

type HistorialRow = Omit<HistorialResponse, "metadata">;

export interface FiltrosHistorialPagina extends HistorialFiltrosState {
  page: number;
  limit: number;
}

export interface TablaHistorialProps {
  data: PaginatedHistorialResponse;
  usuariosOpciones: { label: string; value: string }[];
  filtros: FiltrosHistorialPagina;
}

const estadoConfig: Record<string, { label: string; variant: ChipVariant }> = {
  success: { label: "Exitoso", variant: "success" },
  failed: { label: "Fallido", variant: "error" },
  review: { label: "En revisión", variant: "warn" },
};

const tipoVariant: Record<string, ChipVariant> = {
  created: "success",
  modified: "info",
  deleted: "error",
  manual_data_load: "warn",
};

function extraerFiltros(filtros: FiltrosHistorialPagina): HistorialFiltrosState {
  return {
    tipo: filtros.tipo,
    entidad: filtros.entidad,
    usuario: filtros.usuario,
    ventana: filtros.ventana,
    desde: filtros.desde,
    hasta: filtros.hasta,
  };
}

export function TablaHistorial({ data, usuariosOpciones, filtros }: TablaHistorialProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mensajes = useMensajes();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResponse | null>(null);
  const [ventanaUsuarioAbierta, setVentanaUsuarioAbierta] = useState(false);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtrosAplicados = extraerFiltros(filtros);
  const [ultimosFiltrosAplicados, setUltimosFiltrosAplicados] = useState(filtrosAplicados);
  const [filtrosPendientes, setFiltrosPendientes] = useState<HistorialFiltrosState>(filtrosAplicados);

  if (JSON.stringify(filtrosAplicados) !== JSON.stringify(ultimosFiltrosAplicados)) {
    setUltimosFiltrosAplicados(filtrosAplicados);
    setFiltrosPendientes(filtrosAplicados);
  }

  const navegar = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const construirParams = (next: FiltrosHistorialPagina) => {
    const params = new URLSearchParams();
    if (next.tipo !== "todas" && next.tipo !== "todos") params.set("type", next.tipo);
    if (next.entidad !== "todas" && next.entidad !== "todos") params.set("model", next.entidad);
    if (next.usuario !== "todos") params.set("usuario", next.usuario);
    if (next.ventana && next.ventana !== "semana") params.set("ventana", next.ventana);
    if (next.desde) params.set("desde", next.desde);
    if (next.hasta) params.set("hasta", next.hasta);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.limit !== 50) params.set("limit", String(next.limit));
    return params;
  };

  const handleAplicarFiltros = () => {
    navegar(construirParams({ ...filtrosPendientes, page: 1, limit: filtros.limit }));
  };

  const handleRestablecerFiltros = () => {
    const fechas = obtenerFechasVentana("semana") || { desde: "", hasta: "" };
    const reset: HistorialFiltrosState = {
      tipo: "todas",
      entidad: "todas",
      usuario: "todos",
      ventana: "semana",
      desde: fechas.desde,
      hasta: fechas.hasta,
    };
    setFiltrosPendientes(reset);
    navegar(construirParams({ ...reset, page: 1, limit: 50 }));
  };

  const handleCambioPagina = (cambios: Partial<Pick<FiltrosHistorialPagina, "page" | "limit">>) => {
    navegar(construirParams({ ...filtros, ...cambios }));
  };

  const handleVerUsuario = async (row: HistorialRow) => {
    if (cargandoUsuario) return;

    setUsuarioSeleccionado(null);
    setVentanaUsuarioAbierta(true);
    setCargandoUsuario(true);
    try {
      const respuesta = await RequestClient<PaginatedResponse<UsuarioResponse>>("usuarios", {
        queryParams: { search: row.username, limit: 1 },
      });
      const usuario = respuesta.results[0];
      if (!usuario) {
        mensajes.error("Usuario no encontrado", `No se encontró un usuario para "${row.username}".`);
        setVentanaUsuarioAbierta(false);
        return;
      }
      setUsuarioSeleccionado(usuario);
    } catch (error) {
      mensajes.error("Error", error instanceof Error ? error.message : "No se pudo obtener el usuario.");
      setVentanaUsuarioAbierta(false);
    } finally {
      setCargandoUsuario(false);
    }
  };

  const columns: TableColumn<HistorialRow>[] = [
    {
      id: "date",
      header: "Fecha",
      cell: (row) => format(new Date(row.date), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      id: "type",
      header: "Acción",
      cell: (row) => (
        <Chip variant={tipoVariant[row.type] || "none"} size="sm">
          {opcionesTipoAccion.find((o) => o.value === row.type)?.label || row.type}
        </Chip>
      ),
    },
    {
      id: "username",
      header: "Usuario",
      accessorKey: "username",
    },
    {
      id: "model_name",
      header: "Entidad",
      accessorKey: "model_name",
    },
    {
      id: "description",
      header: "Descripción",
      accessorKey: "description",
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => {
        const config = estadoConfig[row.status];
        return <Chip variant={config?.variant || "none"} size="sm">{config?.label || row.status}</Chip>;
      },
    },
  ];

  const actionConfig: ActionConfig<HistorialRow> = {
    menu: false,
    options: [
      {
        label: "Ver Usuario",
        icon: "user1",
        condition: (row) => row.username !== "Sistema",
        action: handleVerUsuario,
        render: (row) => (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <BotonIcono icon="user1" onClick={() => handleVerUsuario(row)} />
              </TooltipTrigger>
              <TooltipContent>Ver usuario</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
    ],
  };

  const maxPage = Math.max(1, Math.ceil(data.count / filtros.limit));

  return (
    <div className="flex flex-col gap-6">
      <FiltrosHistorial
        pendientes={filtrosPendientes}
        aplicados={filtrosAplicados}
        usuariosOpciones={usuariosOpciones}
        isPending={isPending}
        onChange={(cambios) => setFiltrosPendientes((prev) => ({ ...prev, ...cambios }))}
        onAplicar={handleAplicarFiltros}
        onRestablecer={handleRestablecerFiltros}
        onExportCSV={() => mensajes.info("Exportando...", "Exportando historial a CSV.")}
        onExportExcel={() => mensajes.info("Exportando...", "Exportando historial a Excel.")}
        onExportPDF={() => mensajes.info("Exportando...", "Exportando historial a PDF.")}
      />

      <TablaConAccionesPaginada
        columns={columns}
        data={data.results}
        rowIdKey="id"
        actionConfig={actionConfig}
        bordered={true}
        isLoading={isPending}
        paginationPosition="both"
        paginationConfig={{
          page: filtros.page,
          maxPage,
          totalRows: data.count,
          onPrev: () => handleCambioPagina({ page: Math.max(1, filtros.page - 1) }),
          onNext: () => handleCambioPagina({ page: Math.min(maxPage, filtros.page + 1) }),
          pageLength: filtros.limit,
          pageLengthOptions: [25, 50, 100, 200],
          onChangePageLength: (length) => handleCambioPagina({ limit: length, page: 1 }),
        }}
      />

      <VentanaInfoUsuario
        open={ventanaUsuarioAbierta}
        onClose={() => setVentanaUsuarioAbierta(false)}
        usuario={usuarioSeleccionado}
        loading={cargandoUsuario}
      />
    </div>
  );
}

export default TablaHistorial;
