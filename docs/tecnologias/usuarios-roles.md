# Requerimientos del Sistema: Usuarios y Roles

Este documento detalla las especificaciones y requerimientos para la implementación de la vista de **Administración de Usuarios** y gestión de roles en el nuevo frontend (Next.js 16).

## 1. Arquitectura y Estrategia de Carga de Datos

*   **Eliminación de Paginación y Filtros en el Backend (Tarea Final)**: Dado que la cantidad de usuarios no será tan grande, se ha decidido que no tiene sentido paginarlos ni filtrarlos desde la base de datos. Eventualmente, se modificará el backend para remover estos parámetros de sus endpoints.
*   **Estrategia Temporal (Frontend Primero)**: Durante la migración inicial del frontend, y para no bloquear el desarrollo, se utilizará el endpoint actual paginado pasando una cantidad excesiva de datos (ej. `size: 9999` o `limit: 9999`) para traer todos los registros de una vez y evadir la paginación.
*   **Búsqueda y Filtrado en el Servidor (Next.js)**: Para reducir el uso de hooks (`useEffect`, o llamadas desde el cliente con TanStack Query), la idea es hacer que un componente reciba los estados o parámetros, y desde el servidor de Next.js se realice la solicitud (fetch) y el filtrado del array resultante, enviando únicamente los datos listos a la tabla.

## 2. Disposición de la Interfaz y Estructura de Archivos

La ruta principal de la vista será `website/app/(pages)/dashboard/administracion/usuarios`.

### 2.1 Archivos requeridos
*   **Rutas**:
    *   `dashboard/administracion/usuarios/page.tsx`: Será la página principal responsable de mostrar el título, la descripción de la sección, los botones de acción (Agregar, Gestionar permisos), gestionar los estados de los filtros y renderizar la tabla.
    *   `dashboard/administracion/usuarios/[id]/editar/page.tsx`: Página dedicada para la edición completa de los datos de un usuario.

*   **Componentes de la funcionalidad** (Se ubicarán en la subcarpeta `components/usuarios/` dentro del dominio del dashboard o bajo `website/app/components/usuarios/`):
    *   `tabla-usuarios.tsx`: Componente encargado de contener la configuración de las columnas, recibir o ejecutar el fetch de datos, aplicar los filtros desde el lado del servidor de Next, y retornar la tabla lista.
    *   `ventana-eliminar-usuario.tsx`: Modal para confirmar la eliminación de un usuario.
    *   `ventana-info-usuario.tsx`: Modal/Ventana para previsualizar los detalles y la información del usuario.
    *   `ventana-permisos-usuario.tsx`: Modal/Ventana para la gestión y asignación de permisos de usuario.

### 2.2 Layout de la Barra de Herramientas (Arriba de la tabla)
Los elementos de búsqueda y filtrado se mostrarán en fila superior con el siguiente comportamiento responsivo:
*   **Buscador (TextField)**: En Desktop ocupará la mitad del ancho (50%), mientras que en Mobile ocupará el 100% del ancho.
*   **Filtros (Estado y Rol)**: En Desktop estarán ubicados arriba (junto o cerca del buscador). En Mobile deben apilarse o reubicarse debajo del buscador.
*   **Botones de Acción Global**: Botón de "Agregar" y botón de "Gestionar permisos". Estos botones ya existen en el sistema de diseño.

### 2.3 Tabla y Acciones de Fila
*   **Paginación**: Se utilizará una tabla simple sin paginado.
*   **Acciones individuales por fila**:
    *   Ver información (Detalles)
    *   Editar
    *   Eliminar
*   **Gestión de Permisos**: Queda **estrictamente prohibido** agregar la edición de permisos como una acción individual dentro de la fila de la tabla. Esta funcionalidad es exclusiva del botón global "Gestionar permisos" posicionado arriba de la tabla.

## 3. Lógica de Negocio y Roles

*   **Modelos**: Se deben crear los modelos y tipos correspondientes para los Roles y Usuarios.
*   **Mapeo Visual de Roles**: Se creará un objeto para mapear los IDs o códigos de los roles a un texto legible para el usuario. Por ejemplo, transformar `limnigrafos-visualizar` a `Visualizar Limnígrafos`.
*   **Lógica de "usuarios-editar"**: 
    *   Este rol no tiene sentido a futuro y la orden es eliminarlo del backend.
    *   Sin embargo, como el frontend se hará primero, la interfaz permitirá editar usuarios tanto a los que tienen rol de `administrador` como a los de `usuarios-editar` temporalmente.
    *   **Excepción en la UI**: Cuando se haga el `GET` de permisos desde el servidor de Next para asignarlos, se debe filtrar y **remover el rol "usuarios-editar"**. Esto asegura que el nuevo frontend esté pensado desde el inicio como si ese rol ya no existiera (no se mostrará ni podrá asignarse).

## 4. Componentes del Sistema de Diseño a Utilizar

Para mantener la consistencia con `Rules.md` y la nueva arquitectura, se utilizarán exclusivamente los componentes centralizados:

*   **Tablas**: 
    *   `@/components/ui/tabla/tabla-con-acciones.tsx` (Componente `TablaConAcciones` que soporta la configuración de acciones sin paginado).
*   **Botones**:
    *   Ubicación: `@/components/ui/botones.tsx`
    *   `BotonAgregar` (Para añadir un nuevo usuario).
    *   `BotonPermisosMasivos` (Para el botón superior de "Gestionar permisos").
    *   `BotonIconoEditar` (Acción de fila).
    *   `BotonIconoEliminar` (Acción de fila).
    *   `BotonIcono` o un `BotonMenu` (Para ver detalles/información en la fila).
*   **Formularios y Campos**:
    *   Ubicación buscador: `@/components/ui/textfield.tsx` (Componente `TextField`).
    *   Ubicación filtros: `@/components/shadcn/select.tsx` (Componente `Select` o equivalentes para dropdowns de Estado y Rol).
