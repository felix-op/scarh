# Reglas de Desarrollo y Arquitectura

Este documento establece las directrices obligatorias de codificación, nomenclatura y estructuración para el proyecto frontend en `website/app`.

---

## 1. Estructura y Contenido de Carpetas

Toda adición de código debe ubicarse estrictamente en la carpeta que le corresponda en `website/app/`:

* **`(pages)`**: Enrutamiento físico de la aplicación. Contiene exclusivamente archivos de enrutamiento de Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`). La lógica de visualización compleja debe delegarse a `screens` o `components`.
* **`components`**: Componentes de interfaz de usuario genéricos, reutilizables y sin dependencia directa de llamadas API específicas del dominio. Organizados en:
  * `ui/`: Presentación pura (botones, iconos, tarjetas, etc.).
  * `forms/`: Inputs, selects y campos genéricos de formularios.
  * `modals/`: Modales y overlays genéricos (envoltorios reutilizables).
  * `layout/`: Estructura del sitio (header, sidebar, nav).
  * `shadcn/`: Componentes primitivos provistos por Shadcn/ui.
* **`hooks`**: React Hooks personalizados que proveen lógica de estado reutilizable no acoplada a una sola vista.
* **`models`**: Definiciones de interfaces, tipos de datos TypeScript y enums del sistema.
* **`screens`**: Componentes visuales complejos, vistas completas o flujos de negocio particulares que se inyectan en las rutas (`page.tsx`). Permiten desacoplar las páginas de la lógica de negocio pesada.
* **`services`**: Lógica de integración de datos, llamadas a API (`apiClient.ts`) y Providers de Contexto de React (`provider.nombre.ts`).
* **`styles`**: Hojas de estilo modulares de CSS e integración de Tailwind v4.
* **`utils`**: Funciones puras de ayuda (helpers) y utilidades de propósito general (formateadores de fecha, parseadores, etc.).

---

## 2. Reglas Críticas de Exportación

* **Prohibido el uso de `export default` fuera de `(pages)`**:
  * Solo los archivos de enrutamiento y puntos de entrada de Next.js en `website/app/(pages)/` tienen permitido usar `export default` (ej. páginas, layouts y rutas API).
  * Todo componente, hook, servicio, modelo o utilidad fuera de ese directorio **debe exportarse utilizando exportaciones nombradas** (ej: `export function Boton()`, `export const useAuth = () => ...`).
  * Esto asegura la coherencia en las importaciones, previene renombrados accidentales al importar y maximiza la eficiencia del autocompletado en el IDE.

---

## 3. Restricciones del Sistema de Diseño (Material Design)

* **No hardcodear colores**:
  * Prohibido utilizar colores en bruto (ej: `#ff0000`, `rgb(33,33,33)`) o clases arbitrarias de Tailwind (ej: `bg-[#0982c8]`, `text-blue-500`) en archivos CSS o código TSX.
  * Se deben utilizar exclusivamente los tokens semánticos definidos en Tailwind (ej: `text-primary`, `bg-success-light`, `border-error`).
* **No hardcodear familias de fuentes**:
  * Toda la tipografía debe resolverse a través del token `--font-outfit` centralizado. No se deben inyectar fuentes directas en CSS o estilos inline.
* **No hardcodear radios de borde (border-radius)**:
  * Prohibido usar clases directas como `rounded-md`, `rounded-2xl` o valores fijos de px para radios en los componentes.
  * Se debe usar el sistema escalar de formas:
    * `--shape-corner-small` (o `rounded-shape-sm`)
    * `--shape-corner-medium` (o `rounded-shape-md`)
    * `--shape-corner-large` (o `rounded-shape-lg`)
    * `--shape-corner-full` (o `rounded-shape-full`)

---

## 4. Convención de Nomenclatura de Archivos

* **Archivos en Kebab-Case**:
  * Todos los nombres de archivos en el proyecto deben escribirse en minúsculas separadas por guiones (kebab-case).
  * Ej: `iconify-icon.tsx`, `botones.tsx`, `cards.tsx`, `api.usuarios.ts`, `provider.autenticacion.ts`.
  * **No usar CamelCase ni PascalCase** en los nombres de archivos. Esto evita problemas de discrepancia de mayúsculas/minúsculas al compilar e importar en diferentes sistemas operativos (Windows vs Linux).
