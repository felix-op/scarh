"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TablaConAccionesPaginada, type ActionConfig, type TableColumn } from "../ui/tabla";
import { ChipEstado } from "../ui/chip-estado";
import { Chip } from "../ui/chip";
import { Boton } from "../ui/botones";
import { useMensajes } from "@services";
import { useMarcarAlertaLeida, useMarcarTodasLeidas } from "@hooks";
import { ETIQUETAS_ESTADO_ALERTA, ETIQUETAS_TIPO_ALERTA, varianteEstadoAlerta } from "@utils";
import type { AlertaResponse, PaginatedAlertaResponse } from "@models";
import { FiltrosAlertas, FILTROS_ALERTAS_POR_DEFECTO, type AlertasFiltrosState } from "./filtros-alertas";

export interface FiltrosAlertasPagina extends AlertasFiltrosState {
  page: number;
  limit: number;
}

export interface TablaAlertasProps {
  data: PaginatedAlertaResponse;
  limnigrafosOpciones: { label: string; value: string }[];
  filtros: FiltrosAlertasPagina;
}

const LIMITE_POR_DEFECTO = 10;

function extraerFiltros(filtros: FiltrosAlertasPagina): AlertasFiltrosState {
  return {
    estado: filtros.estado,
    limnigrafo: filtros.limnigrafo,
    tipo: filtros.tipo,
    lectura: filtros.lectura,
    condicion: filtros.condicion,
    ordering: filtros.ordering,
  };
}

export function TablaAlertas({ data, limnigrafosOpciones, filtros }: TablaAlertasProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mensajes = useMensajes();
  const [isPending, startTransition] = useTransition();
  const filtrosAplicados = extraerFiltros(filtros);
  const [ultimosFiltrosAplicados, setUltimosFiltrosAplicados] = useState(filtrosAplicados);
  const [filtrosPendientes, setFiltrosPendientes] = useState<AlertasFiltrosState>(filtrosAplicados);

  const marcarLeida = useMarcarAlertaLeida();
  const marcarTodasLeidas = useMarcarTodasLeidas();

  if (JSON.stringify(filtrosAplicados) !== JSON.stringify(ultimosFiltrosAplicados)) {
    setUltimosFiltrosAplicados(filtrosAplicados);
    setFiltrosPendientes(filtrosAplicados);
  }

  const navegar = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const construirParams = (next: FiltrosAlertasPagina) => {
    const params = new URLSearchParams();
    (Object.keys(FILTROS_ALERTAS_POR_DEFECTO) as (keyof AlertasFiltrosState)[]).forEach((campo) => {
      if (next[campo] !== FILTROS_ALERTAS_POR_DEFECTO[campo]) params.set(campo, next[campo]);
    });
    if (next.page > 1) params.set("page", String(next.page));
    if (next.limit !== LIMITE_POR_DEFECTO) params.set("limit", String(next.limit));
    return params;
  };

  const handleAplicarFiltros = () => {
    navegar(construirParams({ ...filtrosPendientes, page: 1, limit: filtros.limit }));
  };

  const handleRestablecerFiltros = () => {
    setFiltrosPendientes(FILTROS_ALERTAS_POR_DEFECTO);
    navegar(construirParams({ ...FILTROS_ALERTAS_POR_DEFECTO, page: 1, limit: LIMITE_POR_DEFECTO }));
  };

  const handleCambioPagina = (cambios: Partial<Pick<FiltrosAlertasPagina, "page" | "limit">>) => {
    navegar(construirParams({ ...filtros, ...cambios }));
  };

  // Las filas vienen del Server Component, así que invalidar la caché de TanStack Query
  // no alcanza: hace falta `router.refresh()` para que el servidor las vuelva a pedir.
  const handleMarcarLeida = (alerta: AlertaResponse) => {
    marcarLeida.mutate(
      { id: alerta.id },
      {
        onSuccess: () => startTransition(() => router.refresh()),
        onError: (error) =>
          mensajes.error(
            "No se pudo marcar la alerta",
            error instanceof Error ? error.message : "Intente nuevamente en unos instantes."
          ),
      }
    );
  };

  const handleMarcarTodasLeidas = () => {
    marcarTodasLeidas.mutate(undefined, {
      onSuccess: ({ updated }) => {
        mensajes.success(
          "Alertas marcadas",
          updated === 1 ? "Se marcó 1 alerta como leída." : `Se marcaron ${updated} alertas como leídas.`
        );
        startTransition(() => router.refresh());
      },
      onError: (error) =>
        mensajes.error(
          "No se pudieron marcar las alertas",
          error instanceof Error ? error.message : "Intente nuevamente en unos instantes."
        ),
    });
  };

  const columns: TableColumn<AlertaResponse>[] = [
    {
      id: "estado",
      header: "Lectura",
      cell: (row) => (
        <ChipEstado
          etiqueta={ETIQUETAS_ESTADO_ALERTA[row.estado]}
          variante={varianteEstadoAlerta(row.estado)}
          size="sm"
          anchoFijo
        />
      ),
    },
    {
      // Es un dato distinto del anterior: "leída" es de este usuario, "vigente" es
      // de la condición y vale para todos.
      id: "condicion_activa",
      header: "Condición",
      cell: (row) => (
        <Chip variant={row.condicion_activa ? "warn" : "none"} size="sm">
          {row.condicion_activa ? "Vigente" : "Cerrada"}
        </Chip>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: (row) => ETIQUETAS_TIPO_ALERTA[row.tipo] ?? row.tipo,
    },
    {
      id: "descripcion",
      header: "Descripción",
      cell: (row) => row.descripcion,
    },
    {
      id: "limnigrafo",
      header: "Limnígrafo",
      cell: (row) => row.limnigrafo_codigo ?? "-",
    },
    {
      id: "fecha_hora",
      header: "Fecha y hora",
      cell: (row) => format(new Date(row.fecha_hora), "dd/MM/yyyy HH:mm", { locale: es }),
    },
  ];

  const actionConfig: ActionConfig<AlertaResponse> = {
    options: [
      {
        label: "Ver dispositivo",
        icon: "mapa",
        condition: (row) => row.limnigrafo !== null,
        action: (row) => router.push(`/dashboard/limnigrafos/datos/${row.limnigrafo}`),
      },
      {
        label: "Marcar como leída",
        icon: "check",
        condition: (row) => row.estado === "nuevo",
        action: handleMarcarLeida,
      },
    ],
  };

  const maxPage = Math.max(1, Math.ceil(data.count / filtros.limit));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-4">
        <Boton
          content="Marcar todas como leídas"
          icon="check"
          onClick={handleMarcarTodasLeidas}
          loading={marcarTodasLeidas.isPending}
          disabled={isPending}
        />
      </div>

      <FiltrosAlertas
        pendientes={filtrosPendientes}
        aplicados={filtrosAplicados}
        limnigrafosOpciones={limnigrafosOpciones}
        isPending={isPending}
        onChange={(campo, valor) => setFiltrosPendientes((prev) => ({ ...prev, [campo]: valor }))}
        onAplicar={handleAplicarFiltros}
        onRestablecer={handleRestablecerFiltros}
      />

      <TablaConAccionesPaginada
        columns={columns}
        data={data.results}
        rowIdKey="id"
        actionConfig={actionConfig}
        bordered={true}
        isLoading={isPending}
        disabledSelector={isPending}
        paginationPosition="both"
        emptyStateContent={
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-base font-semibold text-foreground-title">No hay alertas que coincidan con los filtros</p>
            <p className="text-sm text-foreground-secondary">
              Pruebe ampliando el rango o quitando alguno de los filtros aplicados.
            </p>
          </div>
        }
        paginationConfig={{
          page: filtros.page,
          maxPage,
          totalRows: data.count,
          onPrev: () => handleCambioPagina({ page: Math.max(1, filtros.page - 1) }),
          onNext: () => handleCambioPagina({ page: Math.min(maxPage, filtros.page + 1) }),
          pageLength: filtros.limit,
          pageLengthOptions: [10, 25, 50, 100],
          onChangePageLength: (length) => handleCambioPagina({ limit: length, page: 1 }),
        }}
      />
    </div>
  );
}
