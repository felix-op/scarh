# Roadmap de Implementación

Este documento detalla las tareas de implementación de las interfaces y la gestión de estado asíncrono utilizando **Tanstack Query**. Se describen las páginas requeridas y sus funcionalidades específicas.

## 1. Administración de Usuarios
- [x] **Estado actual**: Migrar la implementación de Server Actions a **Tanstack Query**.
- [x] Mostrar los usuarios disponibles en el sistema mediante una lista o tabla.
- [x] Visualizar los datos de cada usuario.
- [x] Permitir modificar los permisos de los usuarios.
- [x] **Filtros**: Implementar filtrado por estado de la cuenta, rol asignado, y otros datos del usuario.
- [x] **Acciones en la tabla**: Implementar botones para Editar, Eliminar y Desactivar usuario.

## 2. Administración del Historial (Auditoría)
- [x] Mostrar el historial global de acciones realizadas por todos los usuarios del sistema.
- [x] **Filtros**: Implementar filtrado por acción, fecha, usuario responsable, y entidad modificada.
- [x] **Acciones por fila**: Agregar botón para **"Ver historia"** (muestra todos los cambios asociados a esa entidad en particular a lo largo del tiempo). *(Nota: filtra por tipo de entidad — usuario/limnígrafo/medición —, no por instancia puntual; se confirmó que alcanza por ahora)*.
- [x] *(Nota Técnica)*: Verificar si la consulta histórica retrospectiva está contemplada en el schema de la BD; de lo contrario, agregarla como requerimiento técnico. *(Resuelto: sólo se filtra por tipo de entidad, no hay filtro por instancia puntual — aceptado así por ahora)*.
- [x] **Exportación**: Implementar menú de exportación dedicado (apartado de las acciones de fila) para exportar los datos a CSV, Excel o PDF. *(UI del menú lista; la lógica real de exportación queda pendiente — por ahora sólo muestra un mensaje "Exportando...")*.
- [x] **Página de detalle**: Crear una página separada para mostrar el detalle de un evento/historia (no usar modal ni drawer). *(Ruta creada como stub/placeholder; el contenido real del detalle queda pendiente)*.
- [x] **Restricciones**: Asegurar que esta sección sea de solo lectura (sin creación, edición ni eliminación).

## 3. Limnígrafos (Dispositivos)

### Capa de datos
- [x] Corregir drift de modelos (`radio_cobertura_metros`, `ultima_medicion`, `configuracion`; fix `ConfiguracionLimnigrafoResponse`).
- [x] Modelo + servicio SSR de `rutas-acceso` (+ barrels).
- [x] Schemas Zod de limnígrafo / configuración.
- [x] Constantes (estado, tipo de comunicación, memoria, buckets de tiempo).
- [x] Helpers en `utils/strings.ts`, `utils/dates.ts`, `utils/ux.ts`.

### API + hooks
- [x] Adaptar `createHandler` para multipart (elegir content-type como `RequestSSR`).
- [x] Route handlers `/api/limnigrafos` (+`[id]`, +`configuracion`).
- [x] Route handlers `/api/rutas-acceso` (+`[id]`, +`descargar`).
- [x] Hooks TanStack `querys.limnigrafos.ts` y `querys.rutas-acceso.ts` (+barrel).

### Componentes genéricos
- [x] `MemoryField` RHF (select de unidad estilo botón dentro del textfield).
- [x] `MultiCheckbox` RHF.
- [x] Campo de tiempo h/m/s RHF.
- [x] `FileField` RHF (.gpx/.kml).
- [x] `InfoTooltip` (wrapper de `shadcn/tooltip`).

### Vista de listado
- [x] Listado completo (SSR → `initialData`, no paginado).
- [x] Filtros locales: búsqueda (código/ubicación), estado, tiempo desde el último dato.
- [x] Botón Agregar (modal `VentanaFormularioRHF`).
- [x] Acciones por fila: ver información, importar datos, ver mediciones, ver en el mapa, estadísticas, editar, eliminar.

### Detalle y edición
- [x] Página `/datos/[id]`: grupos (datos, mantenimiento, especificaciones técnicas) + tooltips de tiempos.
- [x] Acciones del detalle (redirecciones + editar + eliminar, sin "ver más").
- [x] Rutas de acceso: `RutaAccesoCard` + cargar (multipart) / descargar / editar / eliminar.
- [x] Página `/editar/[id]` (PUT limnígrafo + PATCH configuración).
- [x] Página `/importar/[id]` (stub).

### Pendientes a futuro
- [ ] Previsualización en mapa (Leaflet) de las rutas de acceso.
- [ ] **"Cambiar Token"** (`generate_key`): generar y mostrar un token de acceso para el envío de mediciones — endpoint existe, falta UI.
- [ ] Importación real de datos.
- [ ] **Exportación global** (CSV, Excel, PDF) separada de las acciones de fila.

## 4. Mediciones
- [x] Visualización del histórico de mediciones en crudo (listado SSR paginado, responsive).
- [x] Mostrar campos de medición: Siempre `altura` y `fecha_hora`. Opcionalmente `temperatura`, `batería`, etc.
- [x] **Interacción del Frontend**: Asegurar que el frontend **NUNCA** cree mediciones individuales ni interactúe con los endpoints de recepción en tiempo real (seguro o inseguro). La única entrada es la importación masiva. *(El listado es de sólo lectura.)*
- [ ] **Endpoints Backend para Recepción (Desarrollo/Ajuste en Backend para los dispositivos)**:
  - [ ] **Endpoint Inseguro (Legacy / Pruebas)**: Recibir solo `fecha_hora` y `altura`, asignando automáticamente a un "dispositivo de prueba".
  - [ ] **Endpoint Seguro (Nuevo)**: Recibir mediciones mediante token de acceso asociado al limnígrafo.
- [x] **Acciones por fila**: Añadir botón "Ver limnígrafo".
- [x] **Filtros**: Implementar filtrado por fecha y por dispositivo. *(Incluye también fuente, ventana de tiempo y búsqueda.)*
- [ ] **Exportación**: Habilitar exportación a nivel global de la tabla.
- [ ] **Importación de datos**: 
  - [ ] Modalidad 1: Importación enviando ID del limnígrafo asociado (nueva estructura).
  - [ ] Modalidad 2: Importación para la estructura antigua.

## Pendientes a futuro (No contemplados en esta etapa)
- [ ] Desarrollo e interactividad avanzada del **Mapa**.
- [ ] Gestión y visualización de **Ubicaciones** históricas.
- [ ] Tableros de **Estadísticas** y gráficos.
