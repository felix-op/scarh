"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TablaConAcciones } from "../ui/tabla/tabla-con-acciones";
import { ActionConfig, TableColumn } from "../ui/tabla/tabla.types";
import { BotonAgregar } from "../ui/botones";
import { TextField } from "../ui/textfield";
import { Select } from "../ui/select";
import { IconifyIcon } from "../ui/iconify-icon";
import Alert from "../ui/alerts";
import { ChipEstadoLimnigrafo } from "./chip-estado-limnigrafo";
import { VentanaAgregarLimnigrafo } from "./ventana-agregar-limnigrafo";
import { VentanaEliminarLimnigrafo } from "./ventana-eliminar-limnigrafo";
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

  const columns: TableColumn<LimnigrafoResponse>[] = [
    {
      id: "estado",
      header: "Estado",
      cell: (row) => <ChipEstadoLimnigrafo estado={row.estado} />,
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
      header: "Últ. dato",
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
      {/* Toolbar */}
      <div className="flex flex-col-reverse md:flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between w-full">
          <div className="w-full md:flex-1">
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

          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <div className="w-full md:w-48">
              <Select
                label="Estado"
                name="estado"
                options={opcionesEstado}
                value={filtros.estado}
                onChange={(val) => handleFilterChange("estado", val)}
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                label="Tiempo desde el último dato"
                name="tiempo"
                options={opcionesTiempoUltimoDato}
                value={filtros.tiempo}
                onChange={(val) => handleFilterChange("tiempo", val)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-2 items-start md:items-center">
          <BotonAgregar content="Agregar" onClick={() => setIsAddOpen(true)} disabled={!puedeEditar} />
          {!puedeEditar && (
            <Alert variant="alerta" title="Modo de sólo lectura">
              No dispones de los permisos necesarios para agregar o modificar limnígrafos.
            </Alert>
          )}
        </div>
      </div>

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
    </div>
  );
}

export default TablaLimnigrafos;
