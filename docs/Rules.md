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
* **`services`**: Lógica de integración de datos, llamadas a API (`apiClient.ts`), configuraciones de TanStack Query/Axios y Providers de Contexto de React (`provider.nombre.ts`).
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

---

## 5. Importaciones y Uso de React

* **Importación eficiente de React (React 17+ / React 19)**:
  * Prohibido realizar `import React from "react"` si no es necesario (el compilador de JSX lo maneja de forma automática).
  * Cuando se requieran elementos internos (como hooks, tipos o referencias), se deben importar de forma destructurada directamente desde `"react"`.
  * Ejemplo **Correcto**: `import { useState, useEffect, Ref } from "react";`
  * Ejemplo **Incorrecto**: `import React from "react";` seguido de `React.useState(...)`.
  * Esto reduce código innecesario, mantiene el estilo consistente y optimiza el proceso de *tree shaking* del empaquetador.

---

## 6. TypeScript: Prohibición de `any` y Manejo de Errores

* **Evitar el uso de `any`**:
  * Queda estrictamente prohibido el uso de `any` para resolver conflictos de tipado. Toda variable, parámetro, retorno de función y payload de API debe estar tipado correctamente.
  * Para peticiones, se deben definir tipos genéricos (ej: `TBody` para el cuerpo y `TResponse` para la respuesta).
* **Uso de Directivas de Supresión**:
  * En casos excepcionales donde el tipado de librerías de terceros (como NextAuth/Auth.js) presente limitaciones de diseño o intersecciones de tipos forzadas (ej: inyección de propiedades de `AdapterUser` en flujos de `CredentialsProvider`), se debe utilizar la directiva `// @ts-expect-error` explicativa antes de recurrir a casts con `as any`.
  * Ejemplo:
    ```typescript
    // @ts-expect-error - NextAuth v5 fuerza la compatibilidad con el tipo AdapterUser en session.user
    session.user = token.user;
    ```

---

## 7. Evitar Nombres Reservados de Next.js en Utilidades

* **Prohibición de Nombres Reservados**:
  * Dentro de la carpeta de desarrollo `website/app/` (incluso en subdirectorios como `models`, `services`, `utils`), no se deben nombrar archivos generales de código usando nombres de enrutamiento reservados de Next.js.
  * Evita nombres de archivo como `page.ts`, `layout.ts`, `error.ts`, `loading.ts`, `not-found.ts`, `template.ts`.
  * Ej: Utiliza `backend.ts` o `api.ts` en lugar de `error.ts` para modelos o utilidades, previniendo malentendidos y conflictos en el ruteador del framework.

---

## 8. Convención JSDoc para VS Code

* **Documentación a Nivel de Clase o Interfaz**:
  * Para asegurar que VS Code renderice correctamente las descripciones de las propiedades durante el autocompletado y al pasar el cursor sobre las variables (hover), documenta todas las propiedades utilizando etiquetas `@property {tipo} [nombre] Descripción` dentro del bloque principal de JSDoc de la interfaz o clase.
  * Evita documentar las propiedades de forma inline dentro del cuerpo de la interfaz para mantener el código limpio y maximizar la visibilidad en los tooltips.
  * Ejemplo:
    ```typescript
    /**
     * Opciones para peticiones HTTP.
     * @property {string} [url] URL opcional de destino.
     * @property {string[]} [tags] Etiquetas de caché de Next.
     */
    export interface RequestOptions {
      url?: string;
      tags?: string[];
    }
    ```

---

## 9. Dependencias

El conjunto instalado en `website/package.json` cubre las necesidades del proyecto.
Antes de agregar una librería, revisar esta lista: varias entradas están acá porque
ya se evaluaron y se descartaron con un motivo concreto.

* **Versiones exactas**: sin `^` ni `~`. Instalar con `pnpm add --save-exact`.

* **No agregar**:

  | Paquete | Motivo |
  |---|---|
  | `xlsx`, `exceljs` | Entre 600 kB y 1 MB de bundle para una acción ocasional. La exportación a Excel se genera en Django con `openpyxl`, donde no viaja al navegador. |
  | `simple-statistics`, `d3-array` | El cálculo estadístico es del backend (`/estadisticas/tabla/`). Duplicarlo en el cliente es lo que hacía que la misma variable, en el mismo rango, mostrara un desvío estándar distinto según la pestaña: el backend lo calcula muestral (divide por n-1) y el cliente lo hacía poblacional (divide por n). |
  | `papaparse` | El armado de CSV está resuelto en `utils/exportar.utiles.ts`, con BOM UTF-8 para que Excel respete los acentos. |
  | `radix-ui` (paquete monolítico) | Duplica los primitivos individuales `@radix-ui/react-*` ya instalados. |
  | `moment` | `date-fns` ya está instalado y es tree-shakeable. |

* **Clientes HTTP**: no se llama a `axios` ni a `fetch` directamente desde un
  componente. Hay dos envoltorios, uno por contexto:

  | Envoltorio | Cuándo |
  |---|---|
  | `RequestSSR` (`services/apiClient.ts`) | Lectura desde el servidor: Server Components y Server Actions. Inyecta el token de sesión y maneja los tags de caché de Next. |
  | `RequestClient` (`services/requestClient.ts`) | Interacciones de cliente, normalmente detrás de TanStack Query. Envuelve una instancia de `axios` con interceptores propios. |

  Si `RequestClient` no alcanza para un caso, se lo extiende; y si hace falta algo que
  no encaja en el envoltorio, usar `axios` directamente es válido. Lo que no
  corresponde es duplicar la configuración base en cada llamada.

* **Iconos**: `lucide-react` está instalado porque lo traen los primitivos de shadcn.
  Los iconos propios van por `components/ui/iconify-icon.tsx`, que es el estándar del
  proyecto.

* **`recharts`** es la librería de gráficos. Se eligió sobre `chart.js` (API imperativa
  sobre canvas: no es estilable con Tailwind ni inspeccionable), `visx`/`d3` (exigen
  escribir ejes, escalas y tooltips a mano) y `echarts` (>300 kB, necesario recién si
  aparecen requisitos de zoom sobre millones de puntos). Los componentes propios
  envuelven recharts en `components/graficos/lienzo-grafico.tsx`; no se usa el
  `chart.tsx` de shadcn, escrito para recharts 2.
