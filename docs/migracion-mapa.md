# Migración del Mapa a Next.js 16

Este documento detalla el plan de acción, archivos a crear y tareas a realizar para migrar el mapa de limnígrafos a la nueva arquitectura en la carpeta `website`.

## 1. Primitivas de UI (Agnósticas del negocio)

Crear las abstracciones de Leaflet en español. No deben contener llamadas a API, React Query ni lógica de negocio, solo configuraciones visuales puras de Leaflet.

- [ ] Crear archivo: `website/app/components/ui/mapa.tsx`
  - [ ] Implementar componente `Mapa` (wrapper de `<MapContainer>`).
  - [ ] Implementar componente `MapaMarcador` (wrapper de marcadores, clusters y tooltips).
  - [ ] Implementar componente `MapaRuta` / `MapaPoligono` (si aplica).
  - [ ] Implementar componentes de controles genéricos (zoom, base layers).

## 2. Componentes de Dominio (Asociados al Negocio)

Crear los componentes que unen la capa visual de mapa con la lógica de negocio de los limnígrafos.

- [ ] Crear directorio: `website/app/components/mapa/`
- [ ] Crear archivo: `website/app/components/mapa/limnigrafo-map-detail.tsx`
  - [ ] Card que muestra la última medición, el estado y variables vitales al hacer click en un marcador.
- [ ] Crear archivo: `website/app/components/mapa/limnigrafo-map-menu.tsx`
  - [ ] Pequeño menú contextual para el marcador.
  - [ ] Opciones: "Agregar ubicación" (si no tiene), "Editar ubicación", "Borrar ubicación" y "Ver limnígrafo" (link al detalle).
- [ ] Crear archivo: `website/app/components/mapa/limnigrafos-map-panel.tsx`
  - [ ] Implementar buscador superior.
  - [ ] Botón para mostrar/ocultar filtros.
  - [ ] Mostrar chips de los filtros activos debajo del buscador.
  - [ ] Implementar los 3 filtros:
    - **Ubicación**: Ubicados | No Ubicados | Todos.
    - **Conexión**: Estado de conexión (conectado, sin conexión, etc.) | Todos.
    - **Mediciones**: Estado de la medición (normal, advertencia, peligro) | Todos.
- [ ] Crear archivo: `website/app/components/mapa/map-tabs-options.tsx`
  - [ ] Botonera para controles del mapa: pantalla completa, vista satélite/mapa, vista limpia/lista.

## 3. Lógica de Vista y Filtros (Screen)

- [ ] Crear archivo: `website/app/screens/mapa-screen.tsx`
  - [ ] Inicializar la vista por defecto en el mapa y la lista de limnígrafos.
  - [ ] Implementar ordenamiento de los limnígrafos: `Sin conexión` -> `Demorados` -> `Resto`.
  - [ ] Implementar lógica de excepción de conexión: si un limnígrafo tiene solo `usb` como tipo de comunicación (o no tiene tipo), un estado "sin conexión" se muestra como *default/neutral* en lugar de error.
  - [ ] Integrar el manejo de la ubicación (Agregar, editar, borrar) asegurando que persista en base de datos.
  
## 4. Página y Enrutamiento

- [ ] Crear archivo: `website/app/(pages)/dashboard/mapa/page.tsx`
  - [ ] Implementar el Server Component que obtiene la lista inicial de limnígrafos por SSR (ignorando roles por ahora).
  - [ ] Inyectar los datos en el `<MapaScreen initialData={...} />`.

## 5. Limpieza de Dependencias (Posterior)

- [ ] Revisar dependencias de UI originales.
- [ ] Si `leaflet-draw` y `leaflet.fullscreen` ya no se utilizan en la nueva implementación o se reemplazaron por abstracciones propias (como en el caso del botón custom de fullscreen), eliminarlas del package.json en favor del peso del bundle.
