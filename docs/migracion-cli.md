# Tarea 5: CLI de Generación de Archivos y Auto-registro

## Objetivo
Implementar una herramienta de línea de comandos (CLI) en Node.js (ejecutable mediante `npm run generate` o su alias `npm run g`) que automatice la creación estructurada de archivos en el proyecto frontend de Next.js (`website/app`). El CLI garantizará que los nuevos archivos sigan las plantillas del proyecto, admitirá simulaciones de ejecución (dry run) y actualizará automáticamente los archivos de exportación barrel (`index.ts`) correspondientes.

---

## 1. Comportamiento al Ejecutarse sin Argumentos (Ayuda Interactiva)
Si se ejecuta el comando base sin argumentos:
```bash
npm run g
# o
npm run generate
```
El CLI debe imprimir por consola una pantalla de ayuda detallada que contenga:
* El listado de comandos y submódulos disponibles (`app`, `component`, `hook`, `model`, `service`, etc.).
* La descripción clara de la función de cada comando.
* Las banderas (flags) admitidas por cada comando con sus correspondientes abreviaturas.
* Ejemplos prácticos de uso para guiar al desarrollador.

---

## 2. Simulación de Ejecución (`--dry-run`)
El CLI debe soportar una bandera de simulación inspirada en Angular CLI:
* **Flag largo**: `--dry-run`
* **Abreviatura**: `-d`
* **Comportamiento**: Al incluir esta bandera, el CLI no realizará ninguna escritura o modificación física en el disco. En su lugar, listará por consola de manera detallada:
  1. Los archivos que se habrían creado y sus respectivas rutas propuestas.
  2. Los archivos `index.ts` que se verían modificados con sus nuevas exportaciones.

---

## 3. Comportamientos y Opciones por Comando

### A. Módulo `app` (Páginas y Rutas)
Crea estructuras de rutas dentro de `website/app/(pages)`.

#### Nomenclatura del Path de Ruta:
* **Entrada simple** (ej. `login`): Crea la carpeta `(pages)/login/` y su archivo `page.tsx`.
* **Entrada anidada** (ej. `dashboard/usuarios`): Crea recursivamente `(pages)/dashboard/usuarios/` y su archivo `page.tsx`.
* **Soporte para Rutas Dinámicas y Grupos**:
  * Ej: `dashboard/[id]` -> Crea `(pages)/dashboard/[id]/page.tsx`.
  * Ej: `(auth)/registro` -> Crea `(pages)/(auth)/registro/page.tsx`.

#### Archivos Adicionales y Flags de Omisión:
Por defecto, además de `page.tsx` (que renderiza un div con `"Page works!"`), se crean `loading.tsx`, `error.tsx` (con la directiva `'use client'`) y `not-found.tsx`.
* **`-l`** o **`--omit-loading`**: Omite la creación de `loading.tsx`.
* **`-e`** o **`--omit-error`**: Omite la creación de `error.tsx`.
* **`-nf`** o **`--omit-not-found`**: Omite la creación de `not-found.tsx`.

**Ejemplos de Comandos (Modo Largo y Abreviado):**
* **Largo**:
  ```bash
  npm run generate app dashboard/admin --omit-error
  ```
* **Abreviado**:
  ```bash
  npm run g a dashboard/admin -e
  ```

---

### B. Módulo `components` (Componentes)
Los componentes creados a través del CLI deben clasificarse para ubicarse en la subcarpeta correcta.

#### Flags de Ubicación:
* **`-f`** o **`--form`**: Crea el componente en `website/app/components/forms/`.
* **`-l`** o **`--layout`**: Crea el componente en `website/app/components/layout/`.
* **`-u`** o **`--ui`**: Crea el componente en `website/app/components/ui/`.
* **`-m`** o **`--modal`**: Crea el componente en `website/app/components/modals/`. *(Nota: Shadcn no tiene flag pues se descarga vía CLI oficial).*

**Ejemplos de Comandos:**
* **Largo**:
  ```bash
  npm run generate component BotonPersonalizado --ui --dry-run
  ```
* **Abreviado**:
  ```bash
  npm run g c BotonPersonalizado -u -d
  ```

---

### C. Módulo `services` (Servicios e Integración de API)
Genera servicios en `website/app/services/`. Por defecto, el archivo se genera sin lógica compleja si no se especifican flags adicionales.

#### 1. Generación de API CRUD Parametrizada (`-api` y `-endpoint`):
Permite generar de forma automática métodos HTTP basados en la abstracción `apiClient` unificada.
* **Flags**: 
  * `-api`: Métodos separados por comas (valores permitidos: `get`, `post`, `put`, `patch`, `del` / `delete`).
  * `-endpoint`: Endpoint base en la API.
* **Comportamiento**: Genera el archivo `services/api.nombrearchivo.ts` conteniendo plantillas de funciones preconfiguradas con `apiClient` para cada método indicado.

**Ejemplo de Comando:**
```bash
npm run g s usuarios -api get,put,patch,del,post -endpoint users
```
*Genera `website/app/services/api.usuarios.ts` con funciones tipadas para interactuar con `/users`*.

#### 2. Generación de Context Provider (`-provider`):
Permite crear la estructura clásica de React Context para gestionar estado local compartido en un módulo.
* **Flags**: `-provider` o `-p`
* **Comportamiento**: Genera un archivo único `services/provider.nombreprovider.ts` que contiene:
  1. El Context de React.
  2. El Context Provider.
  3. El hook personalizado (ej. `useNombreProvider`) para consumir el contexto.

**Ejemplo de Comando:**
```bash
npm run g s autenticacion -provider
```
*Genera `website/app/services/provider.autenticacion.ts`*.

---

### D. Módulo `models` (Modelos, Tipos y Enums)
Genera definiciones en `website/app/models/` estructurando interfaces y tipos de TypeScript.

#### 1. Consolidación de Modelos e Inserción al Final:
Con el fin de no generar una cantidad excesiva de archivos pequeños en la carpeta, el CLI consolida los modelos de una entidad en un único archivo.
* **Nombre de Archivo**: Se genera como `model.nombrearchivo.ts`.
* **Inserción**: Si el archivo `model.nombrearchivo.ts` ya existe en el disco, el CLI **no lo sobreescribe**. En su lugar, añade el nuevo tipo o interfaz al final del archivo.

#### 2. Definición de Propiedades mediante Argumentos:
Permite declarar las propiedades del modelo separadas por comas.
* **Formato**: `propiedad` (asigna tipo `any` por defecto) o `propiedad:tipo`.
* **Abreviaturas de tipos**:
  * `s` -> `string`
  * `n` -> `number`
  * `b` -> `boolean`
* **Tipos de Unión inline**: Si el tipo contiene comillas o barras verticales (ej. `"activo" | "inactivo"`), se escribe directamente como tipo unión de TypeScript.

**Ejemplo de Comando:**
```bash
npm run g m UsuarioPostResponse usuarios id:n,nombre:s,activo:b,roles:"admin"|"user"
```
*Añade al final de `website/app/models/model.usuarios.ts`:*
```typescript
export interface UsuarioPostResponse {
  id: number;
  nombre: string;
  activo: boolean;
  roles: "admin" | "user";
}
```

#### 3. Generación de Enums / Tipos de Unión Separados (`-enum`):
Para evitar sobrecargar el archivo de modelos principal, los enums o tipos de unión de valores específicos pueden estructurarse en su propio archivo.
* **Flag**: `-enum`
* **Formato**: `npm run g m -enum nombreEnum archivo valor1, valor2, tipo1, tipoAbraviado1, ...`
* **Comportamiento**: Genera el archivo `website/app/models/enum.archivo.ts` conteniendo un tipo unión de TypeScript. El CLI debe mapear las abreviaturas de tipos básicos y eliminar duplicados lógicos (ej. evitar duplicar `string` y `s`).

**Ejemplo de Comando:**
```bash
npm run g m -enum EstadoUsuario usuarios 0, "suspendido", string, s, number, n
```
*Genera `website/app/models/enum.usuarios.ts`:*
```typescript
export type EstadoUsuario = 0 | "suspendido" | string | number;
```

---

## 4. Auto-registro de Exportaciones (Barrel Files)

Al crear cualquier archivo en las carpetas `components`, `hooks`, `models`, `screens`, `services`, `styles` o `utils`, el CLI debe realizar lo siguiente:
1. Localizar el archivo `index.ts` en la raíz de la carpeta destino (ej. `website/app/hooks/index.ts`).
2. Añadir la exportación del nuevo archivo asegurando que no se repitan líneas de exportación:
   ```typescript
   export * from './nombreNuevoArchivo';
   ```
3. Para la carpeta **`components`**:
   * Actualiza el `index.ts` de la subcarpeta destino (ej. `components/forms/index.ts`).
   * Actualiza el `index.ts` global del módulo `components` (`website/app/components/index.ts`) para exportar la subcarpeta completa si no estuviera registrada (ej. `export * from './forms'`).
