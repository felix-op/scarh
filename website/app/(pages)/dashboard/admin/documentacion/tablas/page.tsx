"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TablaSimple,
  TablaConAcciones,
  TablaPaginada,
  TablaConAccionesPaginada,
  BotonVolver,
  Card,
  BotonIcono,
  BotonIconoEditar,
  type TableColumn,
  type ActionConfig,
  type CheckboxConfig,
  type PaginationConfig,
} from "@components";

interface Persona {
  id: number;
  nombre: string;
  rol: string;
  estado: string;
  email: string;
  departamento: string;
}

const PERSONAS: Persona[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  nombre: `Usuario ${i + 1}`,
  rol: i % 3 === 0 ? "Administrador" : i % 3 === 1 ? "Editor" : "Lector",
  estado: i % 4 === 0 ? "Inactivo" : "Activo",
  email: `usuario${i + 1}@example.com`,
  departamento: ["TI", "RRHH", "Operaciones", "Finanzas"][i % 4],
}));

const columns: TableColumn<Persona>[] = [
  { id: "nombre", header: "Nombre", accessorKey: "nombre" },
  { id: "email", header: "Email", accessorKey: "email" },
  { id: "rol", header: "Rol", accessorKey: "rol" },
  { id: "departamento", header: "Departamento", accessorKey: "departamento" },
  {
    id: "estado",
    header: "Estado",
    cell: (row) => (
      <span
        className={`px-2.5 py-1 rounded-shape-sm text-xs font-semibold ${
          row.estado === "Activo"
            ? "bg-success-light text-success-main border border-success-light"
            : "bg-error-light text-error-main border border-error-light"
        }`}
      >
        {row.estado}
      </span>
    ),
  },
];

const menuActions: ActionConfig<Persona> = {
  menu: true,
  options: [
    { label: "Editar", icon: "editar", action: () => alert("Editar") },
    {
      label: "Eliminar",
      icon: "eliminar",
      action: () => alert("Eliminar"),
      className: "text-error",
    },
  ],
};

const directActions: ActionConfig<Persona> = {
  menu: false,
  options: [
    {
      label: "Editar",
      icon: "editar",
      action: () => alert("Editar"),
      render: (row) => <BotonIconoEditar onClick={() => alert(`Editar ${row.nombre}`)} />,
    },
    {
      label: "Eliminar",
      icon: "eliminar",
      action: () => alert("Eliminar"),
      render: (row) => (
        <BotonIcono
          icon="eliminar"
          onClick={() => alert(`Eliminar ${row.nombre}`)}
        />
      ),
    },
  ],
};

export default function DocumentacionTablasPage() {
  const [page, setPage] = useState(1);
  const pageLength = 5;
  const maxPage = Math.ceil(PERSONAS.length / pageLength);
  const paginatedData = PERSONAS.slice(
    (page - 1) * pageLength,
    page * pageLength,
  );

  const paginationConfig: PaginationConfig = {
    page,
    maxPage,
    totalRows: PERSONAS.length,
    onPrev: () => setPage((p) => Math.max(1, p - 1)),
    onNext: () => setPage((p) => Math.min(maxPage, p + 1)),
    pageLength,
    pageLengthOptions: [5, 10, 20],
    onChangePageLength: () => setPage(1),
  };

  const checkboxConfig: CheckboxConfig<Persona> = {
    onSelectionChange: (rows) =>
      console.log(
        "Seleccionadas:",
        rows.map((r) => r.nombre),
      ),
  };

  const [sort, setSort] = useState<{
    column: keyof Persona;
    direction: "asc" | "desc";
  }>({
    column: "nombre",
    direction: "asc",
  });

  const sortedData = [...PERSONAS].sort((a, b) => {
    const comparison = String(a[sort.column]).localeCompare(
      String(b[sort.column]),
      "es",
      { numeric: true, sensitivity: "base" },
    );
    return sort.direction === "asc" ? comparison : -comparison;
  });

  const sortableColumns: TableColumn<Persona>[] = columns.map((column) => {
    if (column.id !== "nombre" && column.id !== "rol") {
      return column;
    }
    return {
      ...column,
      sortable: true,
      sortDirection: sort.column === column.id ? sort.direction : undefined,
      onSort: () =>
        setSort((current) => ({
          column: column.id as keyof Persona,
          direction:
            current.column === column.id && current.direction === "asc"
              ? "desc"
              : "asc",
        })),
    };
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Tablas</h1>
          <p className="text-foreground-secondary">
            Visualización interactiva y tipos de tablas disponibles en el sistema de diseño.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="flex flex-col gap-8">
        {/* 1. Tabla Simple */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">1. Tabla Simple</h2>
          <TablaSimple
            columns={columns}
            data={PERSONAS.slice(0, 5)}
            rowIdKey="id"
          />
        </Card>

        {/* 2. Tabla Simple con Ordenación */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">2. Tabla con Ordenación (Sortable)</h2>
          <TablaSimple
            columns={sortableColumns}
            data={sortedData.slice(0, 5)}
            rowIdKey="id"
          />
        </Card>

        {/* 3. Tabla con Acciones (Menú de 3 puntos) */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">3. Tabla con Acciones en Menú</h2>
          <TablaConAcciones
            columns={columns}
            data={PERSONAS.slice(0, 5)}
            rowIdKey="id"
            actionConfig={menuActions}
          />
        </Card>

        {/* 4. Tabla con Acciones Directas e Selección por Checkbox */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">4. Acciones Directas + Checkbox de Selección</h2>
          <TablaConAcciones
            columns={columns}
            data={PERSONAS.slice(0, 5)}
            rowIdKey="id"
            actionConfig={directActions}
            checkboxConfig={checkboxConfig}
          />
        </Card>

        {/* 5. Tabla Paginada y Completa */}
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">5. Tabla Completa Paginada con Acciones y Selección</h2>
          <TablaConAccionesPaginada
            columns={columns}
            data={paginatedData}
            rowIdKey="id"
            actionConfig={menuActions}
            checkboxConfig={checkboxConfig}
            paginationConfig={paginationConfig}
          />
        </Card>
      </div>
    </div>
  );
}
