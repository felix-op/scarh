"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TablaConAcciones,
  ActionConfig,
  TableColumn,
  BotonAgregar,
  TextField,
  Select,
  IconifyIcon,
  Alert,
  Chip,
  Card,
  ChipEstadoConexion,
  ChipEstadoMedicion,
  VentanaAgregarLimnigrafo,
  VentanaEliminarLimnigrafo,
  VentanaSolicitarToken,
} from "@components";
import { useGetLimnigrafos } from "@hooks";
import {
  opcionesEstado,
  opcionesTiempoUltimoDato,
  coincideTiempoUltimoDato,
  formatFechaHora,
  type TiempoUltimoDatoBucket,
} from "@utils";
import type { LimnigrafoResponse, PaginatedLimnigrafoResponse } from "@models";

export interface TablaLimnigrafosProps {
  initialData: PaginatedLimnigrafoResponse;
  puedeEditar: boolean;
}

function formatBateria(bateria: number | null | undefined): string {
  if (bateria == null) return "-";
  return `${Number(bateria).toFixed(1)} V`;
}

export function TablaLimnigrafos({ initialData, puedeEditar }: TablaLimnigrafosProps) {
  const router = useRouter();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [aEliminar, setAEliminar] = useState<LimnigrafoResponse | null>(null);
  const [aSolicitarToken, setASolicitarToken] = useState<LimnigrafoResponse | null>(null);

  const [filtros, setFiltros] = useState({
    search: "",
    estado: "todos",
    tiempo: "todos",
  });

  const handleSearch = (value: string) => setFiltros((prev) => ({ ...prev, search: value }));
  const handleFilterChange = (key: string, value: string) => setFiltros((prev) => ({ ...prev, [key]: value }));

  const { data: paginatedData, isPending: isLoadingQuery } = useGetLimnigrafos(initialData);
  const limnigrafos = paginatedData?.results || [];

  // Filtrado local
  let filtrados = [...limnigrafos];

  if (filtros.search) {
    const s = filtros.search.toLowerCase();
    filtrados = filtrados.filter(
      (l) => l.codigo?.toLowerCase().includes(s) || l.ubicacion?.nombre?.toLowerCase().includes(s)
    );
  }

  if (filtros.estado !== "todos") {
    filtrados = filtrados.filter((l) => l.estado === filtros.estado);
  }

  if (filtros.tiempo !== "todos") {
    filtrados = filtrados.filter((l) =>
      coincideTiempoUltimoDato(l.ultima_conexion, filtros.tiempo as TiempoUltimoDatoBucket)
    );
  }

  const estaActivo = (campo: "search" | "estado" | "tiempo") => {
    if (campo === "search") return Boolean(filtros.search);
    if (campo === "estado") return filtros.estado !== "todos";
    if (campo === "tiempo") return filtros.tiempo !== "todos";
    return false;
  };

  const valorMostrado = (campo: "search" | "estado" | "tiempo") => {
    if (campo === "search") return filtros.search;
    if (campo === "estado") return opcionesEstado.find((o) => o.value === filtros.estado)?.label || filtros.estado;
    if (campo === "tiempo") return opcionesTiempoUltimoDato.find((o) => o.value === filtros.tiempo)?.label || filtros.tiempo;
    return "";
  };

  const labelFiltro: Record<"search" | "estado" | "tiempo", string> = {
    search: "Búsqueda",
    estado: "Estado",
    tiempo: "Tiempo últ. dato",
  };

  const camposFiltro: ("search" | "estado" | "tiempo")[] = ["search", "estado", "tiempo"];
  const filtrosActivos = camposFiltro.filter(estaActivo);

  const columns: TableColumn<LimnigrafoResponse>[] = [
    {
      id: "estado_conexion",
      header: "Conexión",
      cell: (row) => <ChipEstadoConexion estado={row.estado_conexion} tipoComunicacion={row.tipo_comunicacion} />,
    },
    {
      id: "estado_medicion",
      header: "Últ. medición",
      cell: (row) => <ChipEstadoMedicion estado={row.estado_medicion} />,
    },
    {
      id: "codigo",
      header: "Limnígrafo",
      accessorKey: "codigo",
    },
    {
      id: "ubicacion",
      header: "Ubicación",
      cell: (row) => row.ubicacion?.nombre || "No asignada",
    },
    {
      id: "bateria",
      header: "Batería",
      cell: (row) => formatBateria(row.bateria),
    },
    {
      id: "ultima_conexion",
      header: "Última conexión",
      cell: (row) => formatFechaHora(row.ultima_conexion),
    },
  ];

  const actionConfig: ActionConfig<LimnigrafoResponse> = {
    menu: true,
    options: [
      {
        label: "Ver información",
        icon: "ver",
        className: "text-primary",
        action: (row) => router.push(`/dashboard/limnigrafos/datos/${row.id}`),
      },
      {
        label: "Importar datos",
        icon: "importar",
        className: "text-foreground",
        action: (row) => router.push(`/dashboard/limnigrafos/importar/${row.id}`),
      },
      {
        label: "Ver mediciones",
        icon: "documento",
        className: "text-foreground",
        action: (row) => router.push(`/dashboard/mediciones?limnigrafo=${row.id}`),
      },
      {
        label: "Ver en el mapa",
        icon: "mapa",
        className: "text-foreground",
        action: (row) => router.push(`/dashboard/mapa?limnigrafo=${row.id}`),
      },
      {
        label: "Estadísticas",
        icon: "funcion",
        className: "text-foreground",
        action: (row) => router.push(`/dashboard/estadisticas?limnigrafo=${row.id}`),
      },
      {
        label: "Solicitar token",
        icon: "llave",
        className: "text-warn",
        disabled: !puedeEditar,
        action: (row) => setASolicitarToken(row),
      },
      {
        label: "Editar",
        icon: "editar",
        className: "text-success",
        disabled: !puedeEditar,
        action: (row) => router.push(`/dashboard/limnigrafos/editar/${row.id}`),
      },
      {
        label: "Eliminar",
        icon: "eliminar",
        className: "text-error",
        disabled: !puedeEditar,
        action: (row) => setAEliminar(row),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar en Card con padding 2 */}
      <Card className="p-2">
        <div className="flex flex-col gap-4">
          {/* Fila 1: Buscador y Filtros (Grid responsivo: buscador en fila propia en medianas (md:col-span-2), alineados juntos en grandes (lg:grid-cols-3)) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <div className="w-full md:col-span-2 lg:col-span-1">
              <TextField
                name="search"
                label="Buscar limnígrafo"
                placeholder="Por código o ubicación"
                defaultValue={filtros.search}
                leftIcon={<IconifyIcon variant="search" />}
                onChange={(e) => {
                  const val = e.target.value;
                  const timeout = setTimeout(() => handleSearch(val), 500);
                  return () => clearTimeout(timeout);
                }}
              />
            </div>

            <div className="w-full">
              <Select
                label="Estado"
                name="estado"
                options={opcionesEstado}
                value={filtros.estado}
                onChange={(val) => handleFilterChange("estado", val)}
              />
            </div>

            <div className="w-full">
              <Select
                label="Tiempo desde el último dato"
                name="tiempo"
                options={opcionesTiempoUltimoDato}
                value={filtros.tiempo}
                onChange={(val) => handleFilterChange("tiempo", val)}
              />
            </div>
          </div>

          {/* Fila 2: Chips de filtros activos */}
          <div className="flex flex-wrap items-center gap-2 w-full">
            {filtrosActivos.length === 0 ? (
              <span className="text-sm text-foreground-disabled">Sin filtros activos</span>
            ) : (
              filtrosActivos.map((campo) => (
                <Chip key={campo} variant="info" size="sm">
                  {labelFiltro[campo]}: {valorMostrado(campo)}
                </Chip>
              ))
            )}
          </div>

          {/* Fila 3: Botón Agregar alineado a la derecha */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full">
            <BotonAgregar content="Agregar" onClick={() => setIsAddOpen(true)} disabled={!puedeEditar} />
          </div>

          {!puedeEditar && (
            <Alert variant="alerta" title="Modo de sólo lectura">
              No dispones de los permisos necesarios para agregar o modificar limnígrafos.
            </Alert>
          )}
        </div>
      </Card>

      {/* Tabla */}
      <TablaConAcciones
        columns={columns}
        data={filtrados}
        rowIdKey="id"
        actionConfig={actionConfig}
        isLoading={isLoadingQuery}
        bordered
      />

      {/* Modales */}
      <VentanaAgregarLimnigrafo open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <VentanaEliminarLimnigrafo
        open={!!aEliminar}
        onClose={() => setAEliminar(null)}
        limnigrafo={aEliminar}
      />
      <VentanaSolicitarToken
        open={!!aSolicitarToken}
        onClose={() => setASolicitarToken(null)}
        limnigrafo={aSolicitarToken}
      />
    </div>
  );
}

export default TablaLimnigrafos;
