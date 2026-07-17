"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TablaConAcciones } from "@/components/ui/tabla/tabla-con-acciones";
import { ActionConfig, TableColumn } from "@/components/ui/tabla/tabla.types";
import { BotonAgregar, BotonPermisosMasivos, BotonIconoEditar, BotonIconoEliminar, BotonMenu } from "@/components/ui/botones";
import { TextField } from "@/components/ui/textfield";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { IconifyIcon } from "@/components/ui/iconify-icon";
import { Chip } from "@/components/ui/chip";
import type { UsuarioResponse } from "@/models/usuarios";
import VentanaAgregarUsuario from "./ventana-agregar-usuario";
import VentanaEditarUsuario from "./ventana-editar-usuario";
import VentanaEliminarUsuario from "./ventana-eliminar-usuario";
import VentanaInfoUsuario from "./ventana-info-usuario";
import VentanaPermisosUsuario from "./ventana-permisos-usuario";
import VentanaPermisosMasivos from "./ventana-permisos-masivos";
import Alert from "@/components/ui/alerts";

const OpcionesEstado = [
  { label: "Todos", value: "todos" },
  { label: "Activo", value: "true" },
  { label: "Inactivo", value: "false" },
];

export interface TablaUsuariosProps {
  usuarios: UsuarioResponse[];
  rolesOpciones: { label: string; value: string }[];
  esAdministrador: boolean;
}

export function TablaUsuarios({ usuarios, rolesOpciones, esAdministrador }: TablaUsuariosProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modales states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<UsuarioResponse | null>(null);
  const [deleteUser, setDeleteUser] = useState<UsuarioResponse | null>(null);
  const [infoUser, setInfoUser] = useState<UsuarioResponse | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<UsuarioResponse | null>(null);
  const [permissionsMasivosUsers, setPermissionsMasivosUsers] = useState<UsuarioResponse[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; variant: "exito" | "error" } | null>(null);

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

  const refreshData = () => {
    startTransition(() => {
      router.refresh(); // Invalida la caché de Server Components para actualizar los datos
    });
  };

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
      setPermissionsUser(selectedUsers[0]);
    } else {
      setPermissionsMasivosUsers(selectedUsers);
    }
  };

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
    menu: true, // mostramos menú de opciones
    options: [
      {
        label: "Detalles",
        icon: "documento",
        className: "text-primary",
        action: (row) => setInfoUser(row),
      },
      {
        label: "Permisos",
        icon: "candado",
        className: "text-warn",
        disabled: !canEdit,
        action: (row) => {
          setSelectedUsers([row]);
          setPermissionsUser(row);
        },
      },
      {
        label: "Editar",
        icon: "editar",
        className: "text-success",
        disabled: !canEdit,
        action: (row) => setEditUser(row),
      },
      {
        label: "Cambiar Estado",
        icon: "logout",
        className: "text-warn",
        disabled: !canEdit,
        action: async (row) => {
          const { toggleUsuarioEstadoAction } = await import("@/services/usuarios.actions");
          startTransition(async () => {
            const result = await toggleUsuarioEstadoAction(String(row.id), !row.estado);
            setToastMessage({
              title: result.status === "ok" ? "Éxito" : "Error",
              description: result.message || "",
              variant: result.status === "ok" ? "exito" : "error",
            });
            refreshData();
          });
        },
      },
      {
        label: "Eliminar",
        icon: "eliminar",
        className: "text-error",
        disabled: !canEdit,
        action: (row) => setDeleteUser(row),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Simulada (Podria reemplazarse por el sistema real) */}
      {toastMessage && (
        <div className={`p-4 rounded-md mb-4 text-sm font-medium flex items-center justify-between ${
          toastMessage.variant === "error" ? "bg-error-light/20 text-error" : "bg-success-light/20 text-success"
        }`}>
          <div>
            <strong>{toastMessage.title}: </strong>
            {toastMessage.description}
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-4 hover:opacity-70"><IconifyIcon variant="cancelar" /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col-reverse md:flex-col gap-4">
        {/* Buscador y Filtros (Grid / Row) */}
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
            <div className="w-full md:w-48 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <Select value={filtros.estado} onValueChange={(val) => handleFilterChange("estado", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {OpcionesEstado.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Rol</label>
              <Select value={filtros.rol} onValueChange={(val) => handleFilterChange("rol", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {rolesOpciones.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Acciones de gestión (Flex) */}
        <div className="flex flex-col md:flex-row gap-4 mt-2 items-start md:items-center">
          <div className="flex flex-col md:flex-row w-full gap-2 shrink-0">
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
      </div>

      {/* Tabla */}
      <TablaConAcciones
        columns={columns}
        data={usuariosFiltrados}
        rowIdKey="id"
        actionConfig={actionConfig}
        isLoading={isPending}
        bordered={true}
        checkboxConfig={{
          onSelectionChange: setSelectedUsers
        }}
      />

      {/* Modales */}
      <VentanaAgregarUsuario
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={refreshData}
        handleMessage={setToastMessage}
      />

      <VentanaEditarUsuario
        open={!!editUser}
        onClose={() => setEditUser(null)}
        usuario={editUser}
        onSuccess={refreshData}
        handleMessage={setToastMessage}
      />

      <VentanaEliminarUsuario
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        usuario={deleteUser}
        onSuccess={refreshData}
        handleMessage={setToastMessage}
      />

      <VentanaInfoUsuario
        open={!!infoUser}
        onClose={() => setInfoUser(null)}
        usuario={infoUser}
      />

      <VentanaPermisosUsuario
        open={!!permissionsUser}
        onClose={() => setPermissionsUser(null)}
        usuario={permissionsUser}
        onSuccess={refreshData}
        handleMessage={setToastMessage}
      />

      <VentanaPermisosMasivos
        open={permissionsMasivosUsers.length > 0}
        onClose={() => setPermissionsMasivosUsers([])}
        usuarios={permissionsMasivosUsers}
        onSuccess={refreshData}
        handleMessage={setToastMessage}
      />
    </div>
  );
}
