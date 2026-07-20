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
- [ ] Listado completo de limnígrafos registrados.
- [ ] **Acciones por fila**: 
  - [ ] Editar (redirecciona a una página aparte para la edición).
  - [ ] Eliminar.
- [ ] **Botones/Acciones adicionales por limnígrafo**:
  - [ ] Ir a importar datos.
  - [ ] Exportar datos.
  - [ ] Ver ubicación.
  - [ ] **"Cambiar Token"**: Generar y mostrar un token de acceso para el envío de mediciones (para ingresar luego en el dispositivo físico).
- [ ] **Visualización de datos**: Implementar *Drawer* (panel lateral) para mostrar información detallada del limnígrafo sin sobrecargar la vista principal.
- [ ] **Exportación global**: Añadir menú de exportación (CSV, Excel, PDF) separado de las acciones individuales de fila.

## 4. Mediciones
- [ ] Visualización del histórico de mediciones en crudo.
- [ ] Mostrar campos de medición: Siempre `altura` y `fecha_hora`. Opcionalmente `temperatura`, `batería`, etc.
- [ ] **Interacción del Frontend**: Asegurar que el frontend **NUNCA** cree mediciones individuales ni interactúe con los endpoints de recepción en tiempo real (seguro o inseguro). La única entrada es la importación masiva.
- [ ] **Endpoints Backend para Recepción (Desarrollo/Ajuste en Backend para los dispositivos)**:
  - [ ] **Endpoint Inseguro (Legacy / Pruebas)**: Recibir solo `fecha_hora` y `altura`, asignando automáticamente a un "dispositivo de prueba".
  - [ ] **Endpoint Seguro (Nuevo)**: Recibir mediciones mediante token de acceso asociado al limnígrafo.
- [ ] **Acciones por fila**: Añadir botón "Ver limnígrafo".
- [ ] **Filtros**: Implementar filtrado por fecha y por dispositivo.
- [ ] **Exportación**: Habilitar exportación a nivel global de la tabla.
- [ ] **Importación de datos**: 
  - [ ] Modalidad 1: Importación enviando ID del limnígrafo asociado (nueva estructura).
  - [ ] Modalidad 2: Importación para la estructura antigua.

## Pendientes a futuro (No contemplados en esta etapa)
- [ ] Desarrollo e interactividad avanzada del **Mapa**.
- [ ] Gestión y visualización de **Ubicaciones** históricas.
- [ ] Tableros de **Estadísticas** y gráficos.
