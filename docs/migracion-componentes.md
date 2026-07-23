# Tarea 1: Reorganización de Componentes a `app/components`

## Objetivo
Mover y reestructurar de manera ordenada todos los componentes que actualmente residen en `frontend/shared/componentes` a la nueva ubicación en `website/app/components`, aplicando criterios de clasificación rigurosos y estandarizados para separar la UI de presentación y las utilidades del negocio.

---

## Estructura de Clasificación en Destino

Los componentes dentro de `website/app/components` deben organizarse en las siguientes subcarpetas según su naturaleza y funcionalidad:

1. **`ui` (User Interface Pura)**
   - **Criterio**: Componentes visuales atómicos o de presentación que **no tienen lógica de negocio** ni dependen de estados globales o de red. Son altamente reutilizables.
   - **Ejemplos**: `Boton`, `Separador`, `EstadoChip`, `MetricaCard`, `EstadisticaCard`.

2. **`shadcn` (Componentes Base de Shadcn)**
   - **Criterio**: Exclusivo para componentes generados e instalados por la CLI de Shadcn/ui. Estos componentes actúan como bloques primitivos y no deben ser modificados con lógica de negocio específica.
   - **Ejemplos**: `Button`, `Dialog`, `Input`, `DropdownMenu` (provistos por Shadcn).

3. **`forms` (Campos y Formularios Genéricos)**
   - **Criterio**: Componentes encargados de capturar entradas del usuario, tales como campos de texto, selectores y formularios reutilizables que **no estén atados a un dominio de negocio específico**.
   - **Ejemplos**: `TextField`, `CampoFecha`, `CampoHora`, selectores genéricos de fecha y hora.

4. **`modals` (Ventanas y Diálogos Genéricos)**
   - **Criterio**: Ventanas emergentes, modales y overlays **únicamente de carácter genérico y reutilizable** (como envoltorios base o confirmaciones estructurales). 
   - **Exclusiones**: **NO** se deben migrar en este directorio los modales que contengan lógica o campos específicos de un dominio de negocio (por ejemplo, `AddUserModal`, `ChangePasswordModal`, etc.). Estos componentes deben moverse con sus respectivas pantallas/features o colocarse junto al módulo de la vista correspondiente donde se consumen (ej. en `screens` o en las carpetas de ruta).
   - **Ejemplos permitidos**: `VentanaEliminar`, `VentanaFormulario`, `VentanaConfirmacion` (envoltorios vacíos o modales base parametrizables).

5. **`layout` (Estructura de la Aplicación)**
   - **Criterio**: Componentes estructurales de la interfaz de usuario, típicamente contenedores o elementos globales de navegación.
   - **Ejemplos**: `Nav`, `LimnigrafosSidebar`, Sidebar general, Header, Footer.

---

## Flujo de Trabajo para la Migración de un Componente

1. **Identificación**: Localizar el componente en `frontend/shared/componentes/` y determinar su categoría según las definiciones anteriores. Si se trata de un modal específico de negocio, planificar su reubicación en la vista o pantalla correspondiente en lugar de la carpeta global de componentes.
2. **Traslado**: Mover el archivo a `website/app/components/<categoria>/<NombreComponente>.tsx`.
3. **Actualización de Importaciones**:
   - Ajustar los imports dentro del componente (rutas relativas a otros componentes u utilidades).
   - Asegurar que utilicen aliases de ruta configurados (ej. `@/components/...` o `@/hooks/...`) si se han definido en `tsconfig.json`.
4. **Auto-registro (Exportación Barrel)**:
   * Registrar la exportación del componente en el archivo `index.ts` de su subcarpeta correspondiente (ej. `website/app/components/ui/index.ts`).
   * Actualizar el exportador raíz `website/app/components/index.ts` para exponer el componente a través de la carpeta raíz.
5. **Eliminación del Origen**: Borrar el archivo original en el frontend antiguo una vez confirmada su correcta importación y funcionamiento en la nueva estructura.

---

## Estado de Implementación

### ✅ Realizado
* **Estilos CSS Modulares**: Se crearon las clases visuales de botones y tarjetas en `website/app/styles/botones.css` y `website/app/styles/cards.css`, y se importaron en `globals.css`:
  - Clases `.button`, `.button-animated`, `.button-shine`, `.button-disabled`, `.button-outline` (con variantes por color) y `.button-icon`.
  - Clases `.paper`, `.card`, `.card-animated`, y `.card-status` (con soporte para direcciones y estados).
* **Wrapper de Iconos**: Se creó el componente `IconifyIcon.tsx` en `website/app/components/ui/` con un mapa unificado que reúne todos los iconos del componente original e iconos genéricos de la aplicación.
* **Componente de Tarjetas**: Se implementó `cards.tsx` exponiendo `Paper`, `Card` (con prop `animated`), y `CardStatus` (con props `status` y `direction`).
* **Componentes de Botones**: Se implementó `botones.tsx` exponiendo el botón genérico `Boton`, `BotonIcono`, y todos los botones concretos semánticos requeridos (`BotonGuardar`, `BotonEliminar`, `BotonEditar`, `BotonCancelar` -outlined por defecto-, `BotonConfirmar`, `BotonLogin`, `BotonPassword`, `BotonFiltro`, `BotonVolver` y `BotonVerMas`). Se configuró un interruptor local `const animations = true` para activar/desactivar transiciones y brillo.
* **Actualización de Barrels**: Se crearon/actualizaron los archivos de barril `ui/index.ts` y el general `components/index.ts`.
* **Componentes de Modales**: Se descubrió e integró `modals.tsx`, exponiendo `Ventana`, `VentanaConfirmar` (con variante `eliminar`), `VentanaInfo`, `VentanaFormulario`, y `VentanaFormularioRHF`. 
* **Componente de Estado (Chip)**: Se descubrió e integró `chip.tsx` exponiendo `Chip` para renderizar badges de estado.
* **Componente de Menú**: Se descubrió e integró `menu.tsx` exponiendo `Menu`, que reemplaza estructuralmente al antiguo `MenuAcciones` de `frontend/shared/componentes/menu/MenuAcciones.tsx`.
