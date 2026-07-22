"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TablaConAccionesPaginada, ActionConfig, TableColumn, Chip, ChipVariant } from "@components";
import { useMensajes } from "@services";
import { opcionesFuenteMedicion, obtenerFechasVentana } from "@utils";
import type { MedicionResponse, PaginatedMedicionResponse, LimnigrafoResponse } from "@models";
import { FiltrosMediciones, type MedicionesFiltrosState } from "./filtros-mediciones";

export interface FiltrosMedicionesPagina extends MedicionesFiltrosState {
  page: number;
  limit: number;
}

export interface TablaMedicionesProps {
  data: PaginatedMedicionResponse;
  limnigrafos: LimnigrafoResponse[];
  limnigrafosOpciones: { label: string; value: string }[];
  filtros: FiltrosMedicionesPagina;
}

const fuenteVariant: Record<string, ChipVariant> = {
  manual: "warn",
  automatico: "success",
  import_csv: "info",
  import_json: "info",
};

function formatNumero(valor: number | null, sufijo: string, digitos = 2): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    return "-";
  }
  return `${valor.toFixed(digitos)} ${sufijo}`;
}

function extraerFiltros(filtros: FiltrosMedicionesPagina): MedicionesFiltrosState {
  return {
    limnigrafo: filtros.limnigrafo,
    fuente: filtros.fuente,
    ventana: filtros.ventana,
    desde: filtros.desde,
    hasta: filtros.hasta,
    busqueda: filtros.busqueda,
  };
}

export function TablaMediciones({ data, limnigrafos, limnigrafosOpciones, filtros }: TablaMedicionesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mensajes = useMensajes();
  const [isPending, startTransition] = useTransition();
  const filtrosAplicados = extraerFiltros(filtros);
  const [ultimosFiltrosAplicados, setUltimosFiltrosAplicados] = useState(filtrosAplicados);
  const [filtrosPendientes, setFiltrosPendientes] = useState<MedicionesFiltrosState>(filtrosAplicados);

  if (JSON.stringify(filtrosAplicados) !== JSON.stringify(ultimosFiltrosAplicados)) {
    setUltimosFiltrosAplicados(filtrosAplicados);
    setFiltrosPendientes(filtrosAplicados);
  }

  const limnigrafoNombrePorId = new Map(limnigrafos.map((limnigrafo) => [limnigrafo.id, limnigrafo.codigo]));

  const navegar = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const construirParams = (next: FiltrosMedicionesPagina) => {
    const params = new URLSearchParams();
    if (next.limnigrafo !== "todos") params.set("limnigrafo", next.limnigrafo);
    if (next.fuente !== "todas") params.set("fuente", next.fuente);
    if (next.ventana && next.ventana !== "semana") params.set("ventana", next.ventana);
    if (next.desde) params.set("desde", next.desde);
    if (next.hasta) params.set("hasta", next.hasta);
    if (next.busqueda) params.set("busqueda", next.busqueda);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.limit !== 50) params.set("limit", String(next.limit));
    return params;
  };

  const handleAplicarFiltros = () => {
    navegar(construirParams({ ...filtrosPendientes, page: 1, limit: filtros.limit }));
  };

  const handleRestablecerFiltros = () => {
    const fechas = obtenerFechasVentana("semana") || { desde: "", hasta: "" };
    const reset: MedicionesFiltrosState = {
      limnigrafo: "todos",
      fuente: "todas",
      ventana: "semana",
      desde: fechas.desde,
      hasta: fechas.hasta,
      busqueda: "",
    };
    setFiltrosPendientes(reset);
    navegar(construirParams({ ...reset, page: 1, limit: 50 }));
  };

  const handleCambioPagina = (cambios: Partial<Pick<FiltrosMedicionesPagina, "page" | "limit">>) => {
    navegar(construirParams({ ...filtros, ...cambios }));
  };

  const columns: TableColumn<MedicionResponse>[] = [
    {
      id: "fecha_hora",
      header: "Fecha y hora",
      cell: (row) => format(new Date(row.fecha_hora), "dd/MM/yyyy HH:mm", { locale: es }),
    },
    {
      id: "limnigrafo",
      header: "Limnígrafo",
      cell: (row) =>
        row.limnigrafo !== null ? limnigrafoNombrePorId.get(row.limnigrafo) ?? `ID ${row.limnigrafo}` : "-",
    },
    {
      id: "fuente",
      header: "Fuente",
      cell: (row) => (
        <Chip variant={fuenteVariant[row.fuente] || "none"} size="sm">
          {opcionesFuenteMedicion.find((o) => o.value === row.fuente)?.label || row.fuente}
        </Chip>
      ),
    },
    {
      id: "altura_agua",
      header: "Altura de agua",
      cell: (row) => formatNumero(row.altura_agua, "m"),
    },
    {
      id: "presion",
      header: "Presión",
      cell: (row) => formatNumero(row.presion, "hPa"),
    },
    {
      id: "temperatura",
      header: "Temperatura",
      cell: (row) => formatNumero(row.temperatura, "°C"),
    },
    {
      id: "nivel_de_bateria",
      header: "Batería",
      cell: (row) => formatNumero(row.nivel_de_bateria, "%", 1),
    },
  ];

  const actionConfig: ActionConfig<MedicionResponse> = {
    menu: false,
    options: [
      {
        label: "Ver limnígrafo",
        icon: "mapa",
        disabled: true,
        action: () => {},
      },
    ],
  };

  const maxPage = Math.max(1, Math.ceil(data.count / filtros.limit));

  return (
    <div className="flex flex-col gap-6">
      <FiltrosMediciones
        pendientes={filtrosPendientes}
        aplicados={filtrosAplicados}
        limnigrafosOpciones={limnigrafosOpciones}
        isPending={isPending}
        onChange={(campo, valor) => setFiltrosPendientes((prev) => ({ ...prev, [campo]: valor }))}
        onAplicar={handleAplicarFiltros}
        onRestablecer={handleRestablecerFiltros}
        onExportCSV={() => mensajes.info("Exportando...", "Exportando mediciones a CSV.")}
        onExportExcel={() => mensajes.info("Exportando...", "Exportando mediciones a Excel.")}
        onExportPDF={() => mensajes.info("Exportando...", "Exportando mediciones a PDF.")}
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
    </div>
  );
}

export default TablaMediciones;
