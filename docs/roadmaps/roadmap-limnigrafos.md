# Roadmap de Limnígrafos

La gestión de dispositivos está funcionando: listado con filtros locales, alta por
modal, detalle en `/datos/[id]` con grupos de información y tooltips, edición en
`/editar/[id]` (limnígrafo + configuración), rutas de acceso con carga, descarga,
edición y borrado, y acciones por fila hacia mediciones, mapa y estadísticas.

Queda esto.

---

## 1. Cambiar token de acceso

- [ ] El endpoint existe (`generate_key` en `LimnigrafoViewSet`) y el componente
      `VentanaSolicitarToken` está creado. Falta cerrar el flujo: generar el token,
      mostrarlo **una sola vez** y dejarlo copiable.

      Es la operación que habilita a un dispositivo a enviar mediciones, así que el
      token no puede quedar recuperable después de cerrar la ventana ni aparecer en
      logs. `TokenConClipboard` ya resuelve la parte de mostrar y copiar.

## 2. Importación real de datos

- [ ] `/importar/[id]` es un stub. La previsualización, la validación por fila y el
      commit masivo están del lado del backend
      (`validate-import` y `bulk-import` en `MedicionViewSet`), y los componentes de
      tabla de previsualización existen en `components/mediciones/`.

      Ver `roadmap-mediciones.md`, donde está el detalle de las dos modalidades de
      importación.

## 3. Previsualización de rutas de acceso en el mapa

- [ ] Las rutas se cargan como `.gpx`/`.kml` y se pueden descargar, pero no se ven.
      Mostrarlas sobre el mapa requiere una primitiva de polilínea en las abstracciones
      de Leaflet, que hoy no existe (ver `roadmap-mapa.md`, punto 3).

## 4. Exportación global del listado

- [ ] Hoy la exportación vive en las acciones por fila. Falta una exportación del
      listado completo con los filtros aplicados.

      Mismo criterio que en estadísticas: el CSV se arma en el cliente con
      `utils/exportar.utiles.ts`; si aparece Excel, va por endpoint de Django.
