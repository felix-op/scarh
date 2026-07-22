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
  VentanaInfoUsuario,
} from "@components";
import { RequestClient, useMensajes } from "@services";
import { opcionesTipoAccion } from "@utils";
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

export function TablaHistorial({ data, usuariosOpciones, filtros }: TablaHistorialProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mensajes = useMensajes();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const navegar = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const actualizarFiltros = (cambios: Partial<FiltrosHistorialPagina>) => {
    const next = { ...filtros, ...cambios, page: "page" in cambios ? (cambios.page as number) : 1 };
    const params = new URLSearchParams();
    if (next.tipo !== "todas" && next.tipo !== "todos") params.set("type", next.tipo);
    if (next.entidad !== "todas" && next.entidad !== "todos") params.set("model", next.entidad);
    if (next.usuario !== "todos") params.set("usuario", next.usuario);
    if (next.ventana && next.ventana !== "semana") params.set("ventana", next.ventana);
    if (next.desde) params.set("desde", next.desde);
    if (next.hasta) params.set("hasta", next.hasta);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.limit !== 50) params.set("limit", String(next.limit));
    navegar(params);
  };

  const handleVerHistoriaCompleta = (row: HistorialRow) => {
    const params = new URLSearchParams();
    params.set("model", row.model_name);
    navegar(params);
  };

  const handleVerUsuario = async (row: HistorialRow) => {
    try {
      const respuesta = await RequestClient<PaginatedResponse<UsuarioResponse>>("usuarios", {
        queryParams: { search: row.username, limit: 1 },
      });
      const usuario = respuesta.results[0];
      if (!usuario) {
        mensajes.error("Usuario no encontrado", `No se encontró un usuario para "${row.username}".`);
        return;
      }
      setUsuarioSeleccionado(usuario);
    } catch (error) {
      mensajes.error("Error", error instanceof Error ? error.message : "No se pudo obtener el usuario.");
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
    menu: true,
    options: [
      {
        label: "Ver Detalle",
        icon: "documento",
        action: (row) => router.push(`/dashboard/admin/historial/${row.id}`),
      },
      {
        label: "Historia Completa",
        icon: "historial",
        action: handleVerHistoriaCompleta,
      },
      {
        label: "Ver Usuario",
        icon: "user1",
        condition: (row) => row.username !== "Sistema",
        action: handleVerUsuario,
      },
    ],
  };

  const maxPage = Math.max(1, Math.ceil(data.count / filtros.limit));

  return (
    <div className="flex flex-col gap-6">
      <FiltrosHistorial
        filtros={filtros}
        usuariosOpciones={usuariosOpciones}
        isPending={isPending}
        onChange={actualizarFiltros}
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
          onPrev: () => actualizarFiltros({ page: Math.max(1, filtros.page - 1) }),
          onNext: () => actualizarFiltros({ page: Math.min(maxPage, filtros.page + 1) }),
          pageLength: filtros.limit,
          pageLengthOptions: [25, 50, 100, 200],
          onChangePageLength: (length) => actualizarFiltros({ limit: length, page: 1 }),
        }}
      />

      <VentanaInfoUsuario
        open={!!usuarioSeleccionado}
        onClose={() => setUsuarioSeleccionado(null)}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
}

export default TablaHistorial;
