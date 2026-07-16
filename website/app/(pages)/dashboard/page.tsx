"use client";

import { useState } from "react";
import {
    TablaSimple,
    TablaConAcciones,
    TablaPaginada,
    TablaConAccionesPaginada,
    type TableColumn,
    type ActionConfig,
    type CheckboxConfig,
    type PaginationConfig,
    BotonIconoEditar,
    BotonEditar,
    BotonEliminar,
    BotonCancelar,
    BotonGuardar,
    BotonVerMas,
    BotonAgregar,
} from "@components";
import { BotonIcono } from "@components";

// ── Datos de prueba ────────────────────────────────────────────
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

// ── Columnas base ─────────────────────────────────────────────
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
                className={`px-2 py-1 rounded-shape-sm text-xs font-medium ${
                    row.estado === "Activo"
                        ? "bg-success-light text-success-dark"
                        : "bg-error-light text-error-dark"
                }`}
            >
                {row.estado}
            </span>
        ),
    },
];

// ── Acciones ───────────────────────────────────────────────────
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
            render: (row) => (
                <BotonIconoEditar
                    onClick={() => alert(`Editar ${row.nombre}`)}
                />
            ),
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

// ── Componente de prueba ────────────────────────────────────────
export default function DashboardPage() {
    // Paginación
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

    // Selección
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
            {
                numeric: true,
                sensitivity: "base",
            },
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
            sortDirection:
                sort.column === column.id ? sort.direction : undefined,
            onSort: () =>
                setSort((current) => ({
                    column: column.id as keyof Persona,
                    direction:
                        current.column === column.id &&
                        current.direction === "asc"
                            ? "desc"
                            : "asc",
                })),
        };
    });

    return (
        <div className="flex flex-col gap-8 p-6 w-full">
            <h1 className="text-2xl font-bold text-foreground-title">
                Preview — Sistema de Tablas
            </h1>

            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    {" "}
                    Botones
                </h2>
                <div className="flex gap-4">
                    <BotonEditar />
                    <BotonEliminar />
                    <BotonCancelar />
                    <BotonGuardar />
                    <BotonVerMas />
                    <BotonAgregar />
                </div>
            </section>

            {/* 1. TablaSimple */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    1. TablaSimple
                </h2>
                <TablaSimple
                    columns={columns}
                    data={PERSONAS.slice(0, 5)}
                    rowIdKey="id"
                />
            </section>

            {/* 2. TablaSimple con sort */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    2. TablaSimple — con sort (Nombre y Rol)
                </h2>
                <TablaSimple
                    columns={sortableColumns}
                    data={sortedData}
                    rowIdKey="id"
                />
            </section>
            {/* 2. TablaSimple vacía */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    2. TablaSimple — vacía
                </h2>
                <TablaSimple columns={columns} data={[]} rowIdKey="id" />
            </section>

            {/* 3. TablaSimple cargando */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    3. TablaSimple — loading
                </h2>
                <TablaSimple
                    columns={columns}
                    data={[]}
                    rowIdKey="id"
                    isLoading
                    loadingRowCount={3}
                />
            </section>

            {/* 4. TablaConAcciones — menú 3 puntos */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    4. TablaConAcciones — menú
                </h2>
                <TablaConAcciones
                    columns={columns}
                    data={PERSONAS.slice(0, 6)}
                    rowIdKey="id"
                    actionConfig={menuActions}
                />
            </section>

            {/* 5. TablaConAcciones — acciones directas + checkbox */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    5. TablaConAcciones — acciones directas + checkbox
                </h2>
                <TablaConAcciones
                    columns={columns}
                    data={PERSONAS.slice(0, 6)}
                    rowIdKey="id"
                    actionConfig={directActions}
                    checkboxConfig={checkboxConfig}
                />
            </section>

            {/* 6. TablaPaginada */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    6. TablaPaginada
                </h2>
                <TablaPaginada
                    columns={columns}
                    data={paginatedData}
                    rowIdKey="id"
                    paginationConfig={paginationConfig}
                    paginationPosition="both"
                />
            </section>

            {/* 7. TablaConAccionesPaginada */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                    7. TablaConAccionesPaginada
                </h2>
                <TablaConAccionesPaginada
                    columns={columns}
                    data={paginatedData}
                    rowIdKey="id"
                    actionConfig={menuActions}
                    checkboxConfig={checkboxConfig}
                    paginationConfig={paginationConfig}
                />
            </section>
        </div>
    );
}
