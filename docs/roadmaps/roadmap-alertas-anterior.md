# Alertas: listado, filtros y ventana de notificaciones

Alcance acotado, **independiente de `roadmap-alertas.md`** (que sigue congelado: estados de
error de sensor, tipos nuevos, alertas en cargas masivas y umbrales). Acá sólo se expone lo
que el backend **ya genera hoy**:

1. Página `/dashboard/alertas` con tabla paginada, filtros y acción "Ver dispositivo".
2. Ventana (drawer) de notificaciones con las últimas 10, abierta desde el menú de perfil.

---

## Estado actual verificado

| Cosa | Estado |
|---|---|
| Paginación en `AlertaViewSet` | **No existe.** No hay `pagination_class` y `REST_FRAMEWORK` (`backend/core/settings.py:64`) no define `DEFAULT_PAGINATION_CLASS`: el endpoint devuelve una lista plana, no `{count, next, previous, results}`. |
| Filtros / ordering | **No existen.** Sin `filter_backends`, sin `filterset_class`. El orden está fijo en `-alerta__fecha_hora`. |
| Marcar todas como leídas | **Hecho** (llegó con el merge de `main`): `POST /alertas/mark-all-read/`, con test en `tests/test_alerta.py`. Falta consumirlo desde `website/`. |
| Deduplicación / cierre de alertas | **Hecho** (merge de `main`): `Alerta` tiene `condicion`, `condicion_activa` y `fecha_cierre`, con `UniqueConstraint` parcial. Una condición que persiste no crea alertas nuevas, y cuando se resuelve la alerta pasa a `solucionado`. |
| Generación de alertas | Fuera de rango de medición: en el `POST /mediciones/`. Estado del limnígrafo: **sólo** en el comando `manage.py generar_alerta`, que corre cada X segundos. Los `GET` de limnígrafos ya no generan alertas. |
| Modelo del front | `models/models.alertas.ts` ya tipa `PaginatedAlertaResponse` — **hoy miente**, el backend no pagina. |
| Servicio SSR | `services/api/next-server/alertas.ts` completo (list, retrieve, PUT, PATCH). |
| Hooks de cliente | No hay `querys.alertas.ts`. |
| Componentes | No hay `components/alertas/`. |
| Página | No hay ruta de alertas. |

Conclusión: **la paginación y los filtros se hacen en backend**, siguiendo el patrón ya usado
en `UsuarioViewSet` / `LimnigrafoViewSet` / `MedicionViewSet` (`PageNumberPagination` con
`page_size_query_param = 'limit'` + `DjangoFilterBackend` + `OrderingFilter`).

---

## Parte A — Backend

### A1. Paginación y ordering en `AlertaViewSet`

`backend/api/viewsets/AlertaViewSet.py`

- [ ] Agregar `AlertaPagination(PageNumberPagination)` con `page_size = 10`,
      `page_size_query_param = 'limit'`, `max_page_size = 100`. El default 10 sirve
      directo para la ventana de notificaciones (`?limit=10&page=1`).
- [ ] `filter_backends = [DjangoFilterBackend, filters.OrderingFilter]`.
- [ ] `ordering_fields = [('alerta__fecha_hora', 'fecha_hora'), ('estado', 'estado')]`
      — el alias evita exponer el `alerta__` del join al front, que sólo manda
      `?ordering=fecha_hora` / `?ordering=-fecha_hora`.
- [ ] `ordering = ['-alerta__fecha_hora']` y **sacar** el `.order_by()` del `get_queryset`
      para que no pise al `OrderingFilter`. Mantener el `.distinct()`.

### A2. `AlertaFilter`

`backend/api/filters.py` (importar `UsuarioNotificacion`)

- [ ] `estado` — `CharFilter(lookup_expr='iexact')` sobre `UsuarioNotificacion.estado`.
      Ojo: el estado que le importa al usuario es el de **su notificación**, no el de
      `Alerta.estado`. Este último **sí** se escribe ahora: cuando la condición se
      resuelve, `_cerrar_condiciones_resueltas` lo pone en `solucionado`. Son dos cosas
      distintas: "la resolví/la leí" (notificación) vs. "la condición se terminó" (alerta).
- [ ] `activa` — `BooleanFilter(field_name='alerta__condicion_activa')`, para poder ver
      sólo las alertas cuya condición sigue vigente. Es el filtro más útil de todos y no
      existía cuando se escribió este roadmap.
- [ ] `leida` — `BooleanFilter(method=...)`: `true` → `exclude(estado='nuevo')`,
      `false` → `filter(estado='nuevo')`.
      **Decisión a tomar**: `solucionado` cuenta como leída. Se solapa con el filtro
      `estado`; si los dos vienen juntos, el más restrictivo gana (es lo natural con
      django-filter, que encadena). Documentarlo en el docstring del filtro.
- [ ] `limnigrafo` — `NumberInFilter(field_name='alerta__limnigrafo__id', lookup_expr='in')`,
      igual que `MedicionFilter`, así soporta multi-selección más adelante.
- [ ] `tipo` — `CharFilter(field_name='alerta__tipo', lookup_expr='iexact')`.
- [ ] `fecha_desde` / `fecha_hasta` — sobre `alerta__fecha_hora`.
- [ ] `search` — `descripcion` + `alerta__limnigrafo__codigo` (`icontains`).
- [ ] Registrar `filterset_class = AlertaFilter` en el viewset.

### A3. Bug latente en `AlertaSerializer`

`backend/api/serializer/alertaSerializer.py:12`

- [ ] `limnigrafo_codigo = CharField(source="alerta.limnigrafo.codigo", read_only=True)`
      **no tiene `allow_null=True`**. `Alerta.limnigrafo` es `SET_NULL`: si se borra un
      limnígrafo, el `getattr` sobre `None` revienta y **la lista entera devuelve 500**.
      Hoy no se nota porque todos los generadores pasan limnígrafo. Agregar
      `allow_null=True, default=None`. Es una línea y el listado es justamente lo que
      estamos por exponer.

### A4. Contador de no leídas — sin endpoint nuevo

- [ ] No hace falta. La ventana pide `?leida=false&limit=1` y usa `count` de la respuesta
      paginada. Un endpoint `/alertas/no-leidas/` sería redundante.

### A5. Opcional (definir si entra)

- [x] ~~`marcar-todas-leidas`~~ — ya existe como `POST /alertas/mark-all-read/`. Sólo queda
      consumirlo desde la ventana (ver D2).
- [ ] Permiso propio (`alertas-visualizar`). Hoy alcanza con `IsAuthenticated` y las
      notificaciones ya vienen filtradas por usuario; agregar un rol implicaría tocar
      `PREDEFINED_ROLE_NAMES` y `constantes-roles.ts`. **Propuesta: no.**

---

## Parte B — Modelos y utilidades del front

### B1. `website/app/models/models.alertas.ts`

- [ ] `TipoAlerta` = `"fuera_rango_medicion" | "advertencia_limnigrafo" | "peligro_limnigrafo" | "sin_conexion_limnigrafo"`, y tipar `AlertaResponse.tipo` con eso.
- [ ] `limnigrafo_codigo: string | null` (queda así tras A3).
- [ ] `condicion: string | null`, `condicion_activa: boolean`, `fecha_cierre: string | null`
      — el `AlertaSerializer` **todavía no los expone**; agregarlos ahí también. `condicion_activa`
      es lo que distingue "esto sigue pasando" de "esto ya se resolvió", y es la diferencia
      que más va a querer ver el operador en la tabla.
- [ ] `FiltrosAlertasQuery`: `estado`, `leida`, `activa`, `limnigrafo`, `tipo`, `ordering`, `search`, `page`, `limit`.

### B2. `website/app/utils/constantes-alertas.ts` (nuevo)

- [ ] `ETIQUETAS_ESTADO_ALERTA`: `nuevo → "Nueva"`, `leido → "Leída"`, `solucionado → "Solucionada"`.
- [ ] `ETIQUETAS_TIPO_ALERTA` con los textos de `Alerta.TIPOS_CHOICES`.
- [ ] `varianteEstadoAlerta(estado): ChipEstadoVariante` → `nuevo: "warn"`, `leido: "neutral"`, `solucionado: "success"`.
- [ ] `estadoTarjetaPorTipo(tipo): CardStatusProps["status"]` → `peligro_limnigrafo: "error"`,
      `advertencia_limnigrafo: "warning"`, `sin_conexion_limnigrafo: "error"`,
      `fuera_rango_medicion: "warning"`. Es el color de la barra izquierda de `CardStatus`.
- [ ] `opcionesEstadoAlerta`, `opcionesLectura` (`Todas` / `Sólo no leídas` / `Sólo leídas`),
      `opcionesOrdenAlertas` (`Más recientes` = `-fecha_hora`, `Más antiguas` = `fecha_hora`).
- [ ] Exportar desde `utils/index.ts`.

### B3. `website/app/services/api/next-server/alertas.ts`

- [ ] Ya sirve tal cual (`ParamsPaginated` cubre los query params). Único cambio posible:
      revisar que el tag de caché `["alertas"]` se invalide al marcar como leída
      (`revalidateTag`), o que la ventana use TanStack Query del lado cliente y no SSR.
      **Propuesta**: la página usa SSR (`getServerAlertas`), la ventana usa `RequestClient`.

### B4. `website/app/hooks/querys.alertas.ts` (nuevo)

- [ ] `useAlertasRecientes()` — `useQuery`, `["alertas", "recientes"]`, `limit: 10, page: 1`.
- [ ] `useConteoAlertasNoLeidas()` — `useQuery`, `leida: false, limit: 1`, devuelve `count`.
      Sirve para el badge del ítem del menú.
- [ ] `useMarcarTodasLeidas()` — `useMutation` con `POST alertas/mark-all-read/`, devuelve
      `{ updated: number }`. Invalida `["alertas"]`.
- [ ] `useMarcarAlertaLeida()` — `useMutation` con `PATCH alertas/{id}/` y body `{ estado: "leido" }`.
      El `id` es el de `UsuarioNotificacion`, **no** `alerta_id`. Invalida ambas queries y
      hace update optimista para que el resalte se apague al instante.
- [ ] Exportar desde `hooks/index.ts`.

---

## Parte C — Página de listado

### C1. `website/app/(pages)/dashboard/alertas/` (nuevo)

- [ ] `layout.tsx` — `LayoutBase` con título "Alertas" y subtítulo.
- [ ] `loading.tsx` — `FiltersPlaceholder` + `TablePlaceholder`, igual que mediciones.
- [ ] `error.tsx` — copiar el de `(pages)/dashboard/mediciones/(lista)/error.tsx`.
- [ ] `page.tsx` — Server Component: lee `searchParams`, arma los filtros con defaults y
      hace `Promise.all([getServerAlertas(...), getServerLimnigrafos({limit: 1000})])`
      (los limnígrafos alimentan el select del filtro). Pasa todo a `<TablaAlertas />`.

### C2. `website/app/components/alertas/filtros-alertas.tsx` (nuevo)

Mismo patrón que `filtros-mediciones.tsx`: estado pendiente vs. aplicado, chips de filtros
activos, botones "Restablecer" / "Aplicar filtros" a la derecha. Sin botones de exportar.

- [ ] Select **Estado** (Todos / Nueva / Leída / Solucionada).
- [ ] Select **Limnígrafo** (Todos + opciones).
- [ ] Select **Lectura** (Todas / Sólo no leídas / Sólo leídas).
- [ ] Select **Orden** (Más recientes / Más antiguas) — el pedido pide selector, no click
      en el header, así que **no** se usa `TableColumn.sort`.
- [ ] Opcional: Select **Tipo de alerta**, ya que el backend lo va a soportar.

### C3. `website/app/components/alertas/tabla-alertas.tsx` (nuevo)

- [ ] `"use client"`, recibe `{ data: PaginatedAlertaResponse, limnigrafosOpciones, filtros }`.
- [ ] Navegación por URL con `useRouter` + `useTransition`, igual que `TablaMediciones`
      (`construirParams`, `handleAplicarFiltros`, `handleRestablecerFiltros`, `handleCambioPagina`).
- [ ] `TablaConAccionesPaginada<AlertaResponse>` con `rowIdKey="id"`,
      `paginationConfig` derivado de `count` / `limit` / `page`, y `disabledSelector={isPending}`.
- [ ] Columnas: Estado (`ChipEstado` con `anchoFijo`), Tipo, Descripción, Limnígrafo
      (`limnigrafo_codigo ?? "-"`), Fecha (`format(..., "dd/MM/yyyy HH:mm", { locale: es })`).
- [ ] `actionConfig.options`:
      - **Ver dispositivo** → `router.push('/dashboard/limnigrafos/datos/{limnigrafo}')`,
        con `condition: (row) => row.limnigrafo !== null`.
      - **Marcar como leída** → mutación, `condition: (row) => row.estado === "nuevo"`.
- [ ] `emptyStateContent` propio ("No hay alertas que coincidan con los filtros").

### C4. Acceso a la página

- [ ] La ventana de notificaciones tiene el botón "Ver todas" (Parte D). **Además**: decidir
      si va un ítem "Alertas" en `NAV_ITEMS` de `components/sidebar/sidebar.tsx`. No estaba
      en el pedido; **propuesta: no agregarlo por ahora**, se llega desde la ventana.

---

## Parte D — Ventana de notificaciones

### D1. `website/app/components/alertas/item-alerta.tsx` (nuevo)

Reemplaza el `<article>` a mano de `frontend/shared/componentes/alertas/VentanaNotificaciones.tsx`.
De ese archivo se conserva la idea (resalte de no leídas, marcar al hacer click); **no** el
markup, que está lleno de colores crudos (`bg-sky-100`, `rounded-[24px]`) prohibidos por
`docs/Rules.md` §3.

- [ ] `CardStatus` con `status` según el tipo de alerta y `direction="left"` (barra de color
      a la izquierda, tal como se pidió).
- [ ] Cabecera del item: `ChipEstado` + fecha relativa/corta.
- [ ] Descripción y código de limnígrafo.
- [ ] **No leída destacada**: fondo `bg-background-muted` + punto de aviso; el estilo se apaga
      solo cuando cambia el estado.
- [ ] Click en el item → `onSeleccionar(alerta)`: marca como leída (sólo si estaba en `nuevo`)
      **y** expande el item.
- [ ] Expandido → botón "Ver dispositivo" en una fila `flex justify-end`, **sin** `w-full`,
      visible sólo para el item seleccionado y sólo si tiene limnígrafo.
- [ ] Descartar el auto-marcado por hover de 1200 ms del componente viejo: se pidió marcar
      **al hacer click**, y el hover sorprende al usuario.

### D2. `website/app/components/alertas/ventana-notificaciones.tsx` (nuevo)

- [ ] Usar `VentanaInfo` de `components/ui/modals.tsx` (drawer derecho), no `Ventana`/`Dialog`.
      `title="Notificaciones"`, `icon="newNotification"`.
- [ ] Botón "Ver todas las notificaciones" **arriba de la lista**, primer elemento del
      contenido, que hace `router.push("/dashboard/alertas")` y cierra el drawer.
- [ ] Lista de las últimas 10 (`useAlertasRecientes`), estado de carga y vacío.
- [ ] Estado local `seleccionada: number | null` para saber qué item muestra el botón
      "Ver dispositivo".
- [ ] `useMarcarAlertaLeida` con update optimista.

### D3. `website/app/components/sidebar/sidebar-profile-menu.tsx`

- [ ] `useState` para `notificacionesAbiertas`.
- [ ] Ítem nuevo en `items`, primero de la lista:
      `{ label: "Notificaciones", icon: "newNotification", action: () => setNotificacionesAbiertas(true) }`.
      Si entra el contador, el label pasa a `Notificaciones (3)` con `useConteoAlertasNoLeidas`.
- [ ] Envolver el retorno en un fragmento y renderizar `<VentanaNotificaciones />` al lado
      del `<Menu />`.
- [ ] Verificar que el drawer no quede tapado por el `DropdownMenu` de Radix al cerrarse
      (el menú se cierra al hacer click en el ítem, así que debería estar bien; probar en móvil,
      donde el mismo componente se usa desde `sidebar-mobile.tsx`).

### D4. Índices

- [ ] `website/app/components/alertas/index.ts` exportando los cuatro componentes.
- [ ] Agregar `export * from "./alertas";` a `website/app/components/index.ts`.

---

## Archivos tocados — resumen

**Backend (3)**
- `backend/api/viewsets/AlertaViewSet.py` — paginación, filtros, ordering
- `backend/api/filters.py` — `AlertaFilter`
- `backend/api/serializer/alertaSerializer.py` — `allow_null` en `limnigrafo_codigo`

**Front — nuevos (11)**
- `website/app/utils/constantes-alertas.ts`
- `website/app/hooks/querys.alertas.ts`
- `website/app/components/alertas/{index,tabla-alertas,filtros-alertas,item-alerta,ventana-notificaciones}.tsx`
- `website/app/(pages)/dashboard/alertas/{page,layout,loading,error}.tsx`

**Front — modificados (5)**
- `website/app/models/models.alertas.ts`
- `website/app/utils/index.ts`
- `website/app/hooks/index.ts`
- `website/app/components/index.ts`
- `website/app/components/sidebar/sidebar-profile-menu.tsx`

---

## Decisiones pendientes

1. ¿`solucionado` cuenta como "leída" en el filtro `leida`? (propuesta: sí)
2. ~~¿Entra "Marcar todas como leídas"?~~ **Resuelta**: el endpoint ya existe, entra.
3. ¿Ítem "Alertas" en el sidebar? (propuesta: no, se llega desde la ventana)
4. ¿Badge con el contador de no leídas en el avatar del perfil, o sólo en el label del ítem?
5. ~~`Alerta.estado` nunca se escribe~~ **Resuelta**: ahora lo escribe el cierre de
   condiciones. Queda la pregunta de UI: mostrar en la tabla `UsuarioNotificacion.estado`
   (leída/no leída, por usuario), `Alerta.condicion_activa` (vigente/cerrada, global) o
   las dos columnas. (propuesta: las dos, son datos distintos)
