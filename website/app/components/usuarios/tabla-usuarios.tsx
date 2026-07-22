"use client";

import { useState } from "react";
import {
  TablaConAcciones,
  ActionConfig,
  TableColumn,
  BotonAgregar,
  BotonPermisosMasivos,
  TextField,
  Select,
  IconifyIcon,
  Chip,
  Alert,
  Card,
  VentanaAgregarUsuario,
  VentanaEditarUsuario,
  VentanaEliminarUsuario,
  VentanaInfoUsuario,
  VentanaPermisosUsuario,
  VentanaPermisosMasivos,
  VentanaCambiarEstadoUsuario,
} from "@components";
import { useGetUsuarios } from "@hooks";
import type { UsuarioResponse, PaginatedResponse } from "@models";

const OpcionesEstado = [
  { label: "Todos", value: "todos" },
  { label: "Activo", value: "true" },
  { label: "Inactivo", value: "false" },
];

type ModalUsuario =
  | { type: "info"; usuario: UsuarioResponse }
  | { type: "editar"; usuario: UsuarioResponse }
  | { type: "eliminar"; usuario: UsuarioResponse }
  | { type: "permisos"; usuario: UsuarioResponse }
  | { type: "cambiar-estado"; usuario: UsuarioResponse };

export interface TablaUsuariosProps {
  initialData: PaginatedResponse<UsuarioResponse>;
  rolesOpciones: { label: string; value: string }[];
  esAdministrador: boolean;
}

export function TablaUsuarios({ initialData, rolesOpciones, esAdministrador }: TablaUsuariosProps) {
  // Modales states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modal, setModal] = useState<ModalUsuario | null>(null);
  const [permissionsMasivosUsers, setPermissionsMasivosUsers] = useState<UsuarioResponse[]>([]);

  // Filtros locales
  const [filtros, setFiltros] = useState({
    search: "",
    estado: "todos",
    rol: "todos",
  });

  const canEdit = esAdministrador;

  const handleSearch = (value: string) => {
    setFiltros((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const closeModal = () => setModal(null);

  const { data: paginatedData, isPending: isLoadingQuery } = useGetUsuarios(initialData);
  const usuarios = paginatedData?.results || [];

  // Filtrado local de usuarios
  let usuariosFiltrados = [...usuarios];

  if (filtros.search) {
    const s = filtros.search.toLowerCase();
    usuariosFiltrados = usuariosFiltrados.filter((u) =>
      u.nombre_usuario?.toLowerCase().includes(s) ||
      u.first_name?.toLowerCase().includes(s) ||
      u.last_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      (u.legajo && u.legajo.toString().includes(s))
    );
  }

  if (filtros.estado !== "todos") {
    const isActive = filtros.estado === "true";
    usuariosFiltrados = usuariosFiltrados.filter((u) => u.estado === isActive);
  }

  if (filtros.rol !== "todos") {
    usuariosFiltrados = usuariosFiltrados.filter((u) => u.roles && u.roles.includes(filtros.rol));
  }

  const [selectedUsers, setSelectedUsers] = useState<UsuarioResponse[]>([]);

  const handleManagePermissions = () => {
    if (selectedUsers.length === 0) {
      alert("Por favor, seleccione al menos un usuario para gestionar sus permisos.");
      return;
    }
    if (selectedUsers.length === 1) {
      setModal({ type: "permisos", usuario: selectedUsers[0] });
    } else {
      setPermissionsMasivosUsers(selectedUsers);
    }
  };

  const estaActivo = (campo: "search" | "estado" | "rol") => {
    if (campo === "search") return Boolean(filtros.search);
    if (campo === "estado") return filtros.estado !== "todos";
    if (campo === "rol") return filtros.rol !== "todos";
    return false;
  };

  const valorMostrado = (campo: "search" | "estado" | "rol") => {
    if (campo === "search") return filtros.search;
    if (campo === "estado") return filtros.estado === "true" ? "Activo" : "Inactivo";
    if (campo === "rol") return rolesOpciones.find((r) => r.value === filtros.rol)?.label || filtros.rol;
    return "";
  };

  const labelFiltro: Record<"search" | "estado" | "rol", string> = {
    search: "Búsqueda",
    estado: "Estado",
    rol: "Rol",
  };

  const camposFiltro: ("search" | "estado" | "rol")[] = ["search", "estado", "rol"];
  const filtrosActivos = camposFiltro.filter(estaActivo);

  const columns: TableColumn<UsuarioResponse>[] = [
    {
      id: "estado",
      header: "Estado",
      cell: (row) => (
        <Chip variant={row.estado ? "success" : "error"} size="sm">
          {row.estado ? "Activo" : "Inactivo"}
        </Chip>
      ),
    },
    {
      id: "nombre",
      header: "Nombre",
      cell: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      id: "nombre_usuario",
      header: "Usuario",
      accessorKey: "nombre_usuario",
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "legajo",
      header: "Legajo",
      accessorKey: "legajo",
      cell: (row) => row.legajo || "No cargado",
    },
  ];

  const actionConfig: ActionConfig<UsuarioResponse> = {
    menu: true,
    options: [
      {
        label: "Detalles",
        icon: "documento",
        className: "text-primary",
        action: (row) => setModal({ type: "info", usuario: row }),
      },
      {
        label: "Permisos",
        icon: "candado",
        className: "text-warn",
        disabled: !canEdit,
        action: (row) => {
          setSelectedUsers([row]);
          setModal({ type: "permisos", usuario: row });
        },
      },
      {
        label: "Editar",
        icon: "editar",
        className: "text-success",
        disabled: !canEdit,
        action: (row) => setModal({ type: "editar", usuario: row }),
      },
      {
        label: "Activar",
        icon: "activar",
        className: "text-success",
        disabled: !canEdit,
        condition: (row) => !row.estado,
        action: (row) => setModal({ type: "cambiar-estado", usuario: row }),
      },
      {
        label: "Desactivar",
        icon: "desactivar",
        className: "text-warn",
        disabled: !canEdit,
        condition: (row) => row.estado,
        action: (row) => setModal({ type: "cambiar-estado", usuario: row }),
      },
      {
        label: "Eliminar",
        icon: "eliminar",
        className: "text-error",
        disabled: !canEdit,
        action: (row) => setModal({ type: "eliminar", usuario: row }),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar en Card p-2 */}
      <Card className="p-2">
        <div className="flex flex-col gap-4">
          {/* Fila 1: Buscador y Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-end justify-between w-full">
            <div className="w-full md:flex-1">
              <TextField
                name="search"
                label="Buscar Usuario"
                placeholder="Por nombre, apellido, email o usuario"
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
                  options={OpcionesEstado}
                  value={filtros.estado}
                  onChange={(val) => handleFilterChange("estado", val)}
                />
              </div>

              <div className="w-full md:w-48">
                <Select
                  label="Rol"
                  name="rol"
                  options={[{ label: "Todos", value: "todos" }, ...rolesOpciones]}
                  value={filtros.rol}
                  onChange={(val) => handleFilterChange("rol", val)}
                />
              </div>
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

          {/* Fila 3: Botones de acción alineados a la derecha */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full">
            <BotonAgregar content="Agregar" onClick={() => setIsAddOpen(true)} disabled={!canEdit} />
            <BotonPermisosMasivos
              content="Gestionar Permisos"
              onClick={handleManagePermissions}
              disabled={!canEdit || selectedUsers.length === 0}
            />
          </div>

          {!canEdit && (
            <Alert variant="alerta" title="Modo de Sólo Lectura">
              No dispones de los permisos necesarios para realizar modificaciones o agregar usuarios.
            </Alert>
          )}
        </div>
      </Card>

      {/* Tabla */}
      <TablaConAcciones
        columns={columns}
        data={usuariosFiltrados}
        rowIdKey="id"
        actionConfig={actionConfig}
        isLoading={isLoadingQuery}
        bordered={true}
        checkboxConfig={{
          onSelectionChange: setSelectedUsers,
        }}
      />

      {/* Modales */}
      <VentanaAgregarUsuario open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <VentanaEditarUsuario
        open={modal?.type === "editar"}
        onClose={closeModal}
        usuario={modal?.type === "editar" ? modal.usuario : null}
      />

      <VentanaEliminarUsuario
        open={modal?.type === "eliminar"}
        onClose={closeModal}
        usuario={modal?.type === "eliminar" ? modal.usuario : null}
      />

      <VentanaInfoUsuario
        open={modal?.type === "info"}
        onClose={closeModal}
        usuario={modal?.type === "info" ? modal.usuario : null}
      />

      <VentanaPermisosUsuario
        open={modal?.type === "permisos"}
        onClose={closeModal}
        usuario={modal?.type === "permisos" ? modal.usuario : null}
      />

      <VentanaCambiarEstadoUsuario
        open={modal?.type === "cambiar-estado"}
        onClose={closeModal}
        usuario={modal?.type === "cambiar-estado" ? modal.usuario : null}
      />

      <VentanaPermisosMasivos
        open={permissionsMasivosUsers.length > 0}
        onClose={() => setPermissionsMasivosUsers([])}
        usuarios={permissionsMasivosUsers}
      />
    </div>
  );
}

export default TablaUsuarios;
