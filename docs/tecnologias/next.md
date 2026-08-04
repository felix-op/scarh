# Frontend: estructura de `website`

Descripción de la aplicación web del sistema. Cubre el stack, la organización de
carpetas y las convenciones de datos.

Las reglas obligatorias de codificación —nomenclatura, exportaciones, tokens de
diseño, prohibición de `any`, dependencias permitidas— están en `docs/Rules.md`.
Este documento explica **dónde va cada cosa y por qué**; `Rules.md` explica **cómo se
escribe**.

---

## 1. Stack

| Pieza | Versión | Nota |
|---|---|---|
| Next.js | 16 | App Router, Server Components por defecto |
| React | 19 | `ref` como prop, sin `forwardRef` |
| TypeScript | 5.9 | `strict` activado |
| Tailwind CSS | 4 | Configuración en CSS (`@theme`), sin `tailwind.config.js` |
| NextAuth | 5 (beta) | Sesión JWT contra el login de Django |
| TanStack Query | 5 | Sólo para interacciones de cliente |
| shadcn/ui + Radix | — | Primitivos en `components/shadcn/` |
| Leaflet | 1.9 | Mapa de limnígrafos |
| recharts | 3.10 | Gráficos de estadísticas |
| Zod + React Hook Form | — | Validación de formularios y de `searchParams` |
| date-fns | 4 | Todo el formateo de fechas |
| Iconify | — | Iconos vía `components/ui/iconify-icon.tsx` |

---

## 2. Raíz del proyecto

| Archivo | Rol |
|---|---|
| `auth.ts` / `auth.config.ts` | Configuración de NextAuth. `auth()` es la forma de obtener la sesión en el servidor. |
| `next-auth.d.ts` | Extiende los tipos de sesión con los campos propios (`roles`, `legajo`, `accessToken`). |
| `proxy.ts` | Middleware de rutas protegidas. |
| `next.config.ts` | Configuración de Next. |
| `cli/` | Generador de archivos (`pnpm g`). Crea páginas, componentes, servicios y modelos con la plantilla del proyecto y actualiza los barrels. |
| `public/` | Estáticos servidos tal cual. |

---

## 3. Estructura de `app/`

```
app/
├── (pages)/          Enrutamiento. Sólo archivos de Next.
├── api/              Route handlers propios (proxy hacia Django para el cliente)
├── components/       Componentes, clasificados por naturaleza
├── hooks/            Hooks de TanStack Query y utilidades de estado
├── models/           Interfaces, tipos y enums
├── services/         Clientes HTTP, providers de contexto y servicios de API
├── styles/           CSS modular y tokens de Tailwind
├── utils/            Funciones puras
├── layout.tsx        Layout raíz
└── not-found.tsx     404 global
```

### `(pages)/` — enrutamiento

Contiene **exclusivamente** archivos de enrutamiento de Next: `page.tsx`,
`layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`. Es el único
lugar del proyecto donde se permite `export default`.

Una `page.tsx` sólo orquesta: lee `searchParams`, pide datos y arma la vista con
componentes. La lógica de negocio no vive acá.

```
(pages)/
├── page.tsx                      Landing pública
├── login/                        Login y recuperación de contraseña
├── logout/
├── no-autorizado/
└── dashboard/
    ├── layout.tsx                Verifica sesión, monta sidebar
    ├── page.tsx                  Inicio: estado de la flota y actividad
    ├── perfil/
    ├── limnigrafos/              Listado, detalle, edición, importación
    ├── mediciones/               Histórico de mediciones
    ├── estadisticas/             Gráficos, tablas comparativas y resúmenes
    ├── mapa/
    └── admin/
        ├── usuarios/
        ├── historial/            Auditoría
        └── documentacion/        Catálogo visual de componentes
```

### `api/` — route handlers

Endpoints propios de Next que reenvían al backend de Django. Existen porque el
navegador no puede llamar a Django directamente con el token de sesión: la sesión vive
en una cookie httpOnly que sólo el servidor de Next puede leer.

Los usan los hooks de TanStack Query. Las lecturas desde Server Components **no**
pasan por acá: van directo con `RequestSSR`.

Se arman con `createHandler` (`services/handler-server.ts`), que centraliza el reenvío,
la propagación de errores y el manejo de `multipart`.

### `components/` — clasificados por naturaleza

```
components/
├── ui/           Presentación pura, sin dominio ni red
├── shadcn/       Primitivos generados por la CLI de shadcn. No agregarles negocio.
├── formularios/  Campos y wrappers de React Hook Form (sufijo -rhf)
├── layout/       Estructura de la vista (LayoutBase)
├── sidebar/      Navegación
├── graficos/     Gráficos compartidos entre pantallas
├── ventanas/     Modales genéricos
└── <dominio>/    Uno por área: limnigrafos, mediciones, estadisticas,
                  dashboard, perfil, usuarios, historial, mapa
```

La regla de corte entre `ui/` y una carpeta de dominio es la dependencia: si el
componente conoce un modelo del negocio o llama a un servicio, va a la carpeta de
dominio. Si sirve igual en cualquier proyecto, va a `ui/`.

Cada carpeta tiene su `index.ts` y `components/index.ts` reexporta todas. Se importa
siempre por el barrel: `import { Boton } from "@components"`.

### `models/` — contratos de datos

Un archivo por entidad (`models.limnigrafos.ts`, `models.estadistica.ts`, …) más
`backend.ts` con los tipos compartidos (`ApiError`, `Paginado<T>`, `ParamsBase`).

Los tipos reflejan lo que **realmente** devuelve el backend, no lo que sería cómodo.
Se documentan con JSDoc `@property` (ver `Rules.md` §8) para que el autocompletado
muestre la descripción de cada campo.

### `services/` — datos y contexto

| Archivo | Rol |
|---|---|
| `apiClient.ts` | `RequestSSR`: lectura desde el servidor. Inyecta el token de sesión, interpola parámetros de ruta, serializa query params y traduce los errores de Django a `ApiError`. |
| `requestClient.ts` | `RequestClient`: instancia de axios con interceptores, para interacciones de cliente. |
| `handler-server.ts` | `createHandler`: fábrica de los route handlers de `api/`. |
| `api/next-server/*` | Un archivo por recurso con las funciones de lectura SSR (`getSSR*`, `getServer*`). |
| `provider.*.tsx` | Contextos de React: tema, sesión, mensajes flotantes, TanStack Query. |
| `configuracion-local.ts` | Preferencias del navegador (`localStorage`) vía `useSyncExternalStore`. |

### `utils/` — funciones puras

Sin JSX y sin estado. Constantes de dominio, esquemas de Zod, formateadores,
helpers de fecha. Es la capa más testeable del proyecto.

### `styles/` — tokens y CSS modular

`tema.css` declara el bloque `@theme` de Tailwind 4, que mapea variables CSS a
utilidades (`--color-primary` → `bg-primary`). Los valores concretos están en
`tema-claro.css` y `tema-oscuro.css`, y ahí es el **único** lugar donde se escriben
colores en crudo.

El tema oscuro **no** es un aclarado automático del claro: cada token tiene su valor
elegido para su superficie. Esto importa especialmente en la paleta de gráficos
(`--chart-1` … `--chart-8`), cuyos pasos están validados por separado para cada modo.

---

## 4. Datos: cómo se leen y cómo se escriben

### Lectura: Server Components primero

Todo componente y página nace **Server Component**. `"use client"` sólo cuando se
necesitan APIs del navegador: eventos, estado local, efectos, `localStorage`.

El patrón habitual de una pantalla con filtros:

1. `page.tsx` (servidor) lee `searchParams`, los valida con Zod y llama a los
   servicios SSR.
2. Le pasa los datos ya resueltos a un componente cliente que maneja la interacción.
3. Los filtros **escriben en la URL**, no en estado local. La URL es la fuente de
   verdad: la consulta queda compartible, navegable con el botón atrás, y desaparecen
   los `useState` de filtros aplicados versus pendientes.

### Escritura y reactividad: cliente

Para envíos de formulario, encadenamiento de requests, invalidación de caché y
mensajes toast se usa **TanStack Query** sobre los route handlers de `api/`. Los hooks
viven en `hooks/querys.*.ts`.

Cuando lo único que hace falta es volver a pedir los datos del servidor,
`router.refresh()` alcanza y es preferible: reejecuta el Server Component con el mismo
camino de datos, sin duplicar la consulta del lado del cliente.

### Errores

`RequestSSR` traduce los errores del backend a `ApiError`, con `descripcionUsuario`
(texto para mostrar) y `descripcionTecnica` (para logs).

Al atrapar errores en una página hay que **acotar el `catch` a `ApiError` y re-lanzar
el resto**. `RequestSSR` hace `redirect("/logout")` ante un 401, y `redirect()` de Next
funciona lanzando una excepción: un `catch` amplio se la come y deja al usuario con la
sesión vencida mirando un cartel de error, sin forma de volver a entrar.

---

## 5. Alias de importación

Declarados en `tsconfig.json`:

| Alias | Apunta a |
|---|---|
| `@components` | `app/components/index.ts` |
| `@models` | `app/models/index.ts` |
| `@services` | `app/services/index.ts` |
| `@utils` | `app/utils/index.ts` |
| `@hooks` | `app/hooks/index.ts` |
| `@auth` / `@auth-config` | `auth.ts` / `auth.config.ts` |
| `@app/*` | `app/(pages)/*` |
| `@/*` | `app/*` |
| `@styles/*` | `app/styles/*` |

Se importa por el barrel salvo dentro de la propia carpeta, donde conviene la ruta
relativa para no crear un ciclo con el `index.ts`.

---

## 6. Verificación antes de entregar

```bash
pnpm exec tsc --noEmit     # tipos
pnpm lint                  # ESLint, incluye las reglas del compilador de React
pnpm build                 # build de producción
```

`pnpm build` es el que detecta los errores de límite servidor/cliente, que no
aparecen en los otros dos.
