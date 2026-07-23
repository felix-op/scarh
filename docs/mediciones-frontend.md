# Frontend - Migración de Importación de Mediciones a Next.js 16

## 1. Diseño de Interfaz y UX
- **Página dedicada:** La importación pasará de ser un modal flotante a una vista completa (`/dashboard/limnigrafos/importar/[id]`), lo cual dará más espacio para interactuar con tablas grandes.
- **Selector de Limnígrafo:** Los archivos (sobre todo los viejos) no especifican el limnígrafo asociado a cada registro. Se requerirá que el ID se asigne explícitamente desde un selector global en la pantalla (o que venga heredado de la URL).
- **Zona de Drop:** Se implementará un área drag & drop (similar al de cargar rutas) para subir archivos `.csv` y `.json`.

## 2. Parseo Local y Tabla Simplificada
Toda la extracción de datos inicial se hace localmente en el navegador para no saturar al servidor.
- **Formatos soportados y limpieza:**
  - **Formato Viejo (solo `.csv`):** Posee basura en la primera línea (ej. `Limnigrafo Digital Recursos Hidricos;;`). El parseador en el frontend debe ser capaz de ignorar estas cabeceras rotas. Posee solo `Fecha`, `Hora` y `Altura Escala`. 
  - **Formato Nuevo (`.csv` o `.json`):** Posee la estructura estándar de exportación de la plataforma (incluyendo temperatura, presión, etc., y posiblemente el ID del limnígrafo).
- **Manejo de Columnas:** En lugar de renderizar dinámicamente según `Object.keys()`, la tabla simplemente sabrá qué columnas preestablecidas mostrar si se detecta que el archivo es "viejo" o "nuevo". Si el archivo tiene la columna de limnígrafo, la tabla debe ser capaz de mapear ese ID al código visible correspondiente (usando un diccionario `limnigrafoCodeById` alimentado por el backend).

## 3. Asignación del Limnígrafo
Dependiendo de qué tipo de archivo suba el usuario, se definen las siguientes reglas:
- Si el formato es **viejo**, el usuario **debe seleccionar obligatoriamente un limnígrafo de destino** en la interfaz para todas las filas.
- Si el formato es **nuevo pero no posee la columna de limnígrafo**, también debe seleccionar obligatoriamente un limnígrafo.
- Si el formato es **nuevo y sí posee la columna de limnígrafo**, se renderizará el código en la tabla. Aún así, es posible que se requiera preseleccionar uno a través de un Query Param (ej. `?limnigrafo=ID`) para aquellos usuarios que vengan navegando desde la vista individual de un limnígrafo.
- Adicionalmente, en la vista general de mediciones se colocará un botón "Importar" que simplemente redirija a esta página nueva de importación, manteniendo la coherencia de navegación.

## 4. Validación Inicial y Edición Local (NUEVO)
- **Chequeo inmediato:** Ni bien se parsea el archivo, el frontend evaluará tipos básicos de datos. Si un registro tiene error, será marcado en la tabla.
- **Gestión individual (Edición/Eliminación):** El usuario podrá **editar un registro** defectuoso directamente desde la UI o bien podrá **eliminar esa fila** si desea descartarla, antes de hablar con el servidor.
- **Filtros de Tabla:** La vista tendrá filtros rápidos: *Todas*, *Listas para subir*, *Con errores de formato*, *Duplicadas*.

## 5. Flujo de Guardado y Respuestas del Backend
Se abandonará el modelo engorroso de tener un botón para "Validar" y otro para "Confirmar".
- **Botón Único "Importar datos":**
  1. Al pulsarlo, todo el arreglo se envía al backend de Django para validación de base de datos.
  2. El backend evalúa y devuelve un reporte completo (`duplicate_database`, `duplicate_file`, `error` de regla de negocio).
- **Escenarios de Respuesta:**
  - **Éxito Perfecto:** No hubo ni errores ni duplicados. Se procesa la carga completa, se notifica el éxito, y se redirige o se limpia la tabla.
  - **Éxito Parcial (Solo Duplicados):** No hubo errores de datos, pero el backend avisa que 50 de los registros ya existían (están duplicados). Se detiene el proceso y lanza una ventana/diálogo de confirmación: *"Hay 50 registros que ya existen. ¿Querés ignorarlos e importar los demás?"*.
  - **Error Bloqueante:** Hay registros con errores severos o datos no válidos (rechazados por Django). No se carga nada. El modal se cierra, pero la tabla se ilumina mostrando las filas exactas en color rojo con el motivo del fallo para que el usuario pueda arreglarlas/eliminarlas a mano e intentarlo nuevamente.

## 6. Archivos y Estructura a Crear

### En `components/mediciones/`
- [ ] 1. `ventana-editar-medicion.tsx`: Modal para modificar una medición que falló en la validación local o del servidor. (Pendiente)
- [x] 2. `ventana-eliminar-medicion.tsx`: Mapeado exitosamente y delegado al uso del componente unificado `VentanaConfirmar` (variante `eliminar`) de `app/components/ui/modals.tsx`.
- [ ] 3. `ventana-confirmar-guardado.tsx`: Diálogo para confirmar el proceso (especialmente para aprobar ignorar los duplicados en BD si los hay). (Pendiente)
- [ ] 4. `configuraciones-tabla.tsx`: Definiciones de columnas de TanStack Table, desglosado en formatos viejo y nuevo. (Pendiente)
- [ ] 5. `tabla-mediciones-importacion.tsx`: Componente base de la tabla, con soporte de edición in-line/modal y selección de configuraciones. (Pendiente)
- [x] 6. `chip-estado-importacion.tsx`: Mapeado exitosamente y envuelto sobre el componente nativo `Chip` de `app/components/ui/chip.tsx`.
- [x] 7. `acciones-importacion.tsx`: Mapeado exitosamente para utilizar el `Menu` estándar de `app/components/ui/menu.tsx` en lugar de una botonera estática.
- [x] 8. `selector-archivo-importacion.tsx`: Área drag & drop finalizada con validaciones.
- [x] 9. `selector-limnigrafo-importacion.tsx`: Select de limnígrafo finalizado conectado a react-query.

### En `utils/`
- [x] 1. **`utils/mediciones.utiles.ts`**: Funciones puras para procesar la importación. (Realizado: Parser manual customizado sin dependencias externas).
- [x] 2. **`utils/mediciones.schemas.ts`**: Esquemas de Zod para tipar y validar las filas. (Realizado).
