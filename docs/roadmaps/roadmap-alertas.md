# Migración de Alertas y Estados de Medición

Tareas de backend relacionadas con alertas y estados, separadas del roadmap del simulador
porque **se ignoran por ahora**. Se anotan acá para no perderlas.

Ver `docs/roadmaps/roadmap-simulador.md` para el trabajo del simulador y su CLI.

---

## 1. Estados de error de sensor en `estado_medicion`

Hoy `Limnigrafo.estado_medicion` (`backend/api/models/limnigrafo.py:45`) sólo admite
dos valores: `normal` y `fuera_de_rango`, calculados por
`calcular_estado_medicion_limnigrafo` (`backend/api/utils/estado_limnigrafo.py:93`)
a partir de `_campos_fuera_de_rango`.

El firmware real reporta cuatro condiciones de error que hoy no tienen representación.
Los valores centinela viajan **en el campo de altura**:

| Centinela | Origen en el firmware | Estado propuesto |
|---|---|---|
| `-1000` | `errorAction()` — checksum Fletcher16 inválido | `error_sensor_checksum` |
| `-1001` | `cabezal()` — 20 reintentos sin ACK del sensor | `error_sensor_ack` |
| `-1002` | `cabezal()` — sin respuesta al pedido de datos | `sensor_sin_respuesta` |
| `-1003` | `muestraSensor()` — `Bat() <= 5 V` | `bateria_baja` |

Tareas:

- [ ] Ampliar los `choices` de `estado_medicion` con los cuatro estados nuevos
      (etiquetas legibles: "Error de checksum del sensor", "Error de ACK del sensor",
      "Sensor sin respuesta", "Batería baja"). Migración incluida.
- [ ] Que la ingesta **reciba** los centinelas y los traduzca, en lugar de rechazarlos.
      Hoy `validar_datos_medicion` (`serializer/medicionSerializer.py:20`) rechaza
      `altura_agua < 0`, así que un equipo real con el sensor fallado recibe un `400`.
- [ ] Decidir cómo se persiste la medición fallida: `altura_agua = null` + un campo nuevo
      `codigo_error` en `Medicion`, o no crear la medición y sólo registrar el estado.
      Nota: `altura_agua` es `FloatField` **no nullable** hoy, así que la primera opción
      requiere migración.
- [ ] Actualizar `calcular_estado_medicion_limnigrafo` para que el error de sensor tenga
      precedencia sobre `fuera_de_rango`.
- [ ] Frontend: mostrar los estados nuevos en `chip-estado.tsx`, `tabla-limnigrafos.tsx`
      y `detalle-limnigrafo.tsx`.

## 2. Tipos de alerta nuevos

`Alerta.TIPOS_CHOICES` (`backend/api/models/alerta.py:11`) tiene cuatro tipos:
`fuera_rango_medicion`, `advertencia_limnigrafo`, `peligro_limnigrafo`,
`sin_conexion_limnigrafo`. No hay ninguno para falla de sensor.

- [ ] Agregar `error_sensor` (o uno por centinela, a definir) con su descripción por defecto
      en `Alerta.save()`.
- [ ] Generar la alerta desde la ingesta cuando llega un centinela.
- [ ] Revisar si una racha de errores del mismo sensor debe generar **una** alerta o una por
      medición — el equipo real puede reportar el mismo error durante horas y hoy
      `_crear_alerta_para_usuarios` crea una alerta y una `UsuarioNotificacion` por usuario
      activo en cada llamada. Con 100 dispositivos eso es una avalancha de notificaciones.

## 3. Alertas en cargas masivas

- [ ] `MedicionViewSet.bulk_import` y `bulk_create` llaman a
      `generar_alerta_medicion_fuera_de_rango` **por cada medición** del lote.
      Una importación histórica de miles de filas genera miles de alertas retroactivas
      con notificación para todos los usuarios. Definir si se suprimen, se agrupan, o se
      generan sólo para las mediciones más recientes.
- [ ] Aplica también al modo de backfill del simulador (ver roadmap, Parte A).

## 4. Umbrales de alerta: aclaración de responsabilidad

`ConfiguracionLimnigrafo` (umbrales de altura, temperatura, presión, batería y tiempos de
advertencia/peligro) es **configuración de alertas del sistema**, no configuración del
dispositivo. Se edita desde el frontend.

- [ ] Documentarlo explícitamente: el simulador **no** lee ni escribe estos umbrales, y el
      backend **no** configura al dispositivo. Ver la sección de separación de
      responsabilidades del roadmap del simulador.
- [ ] Recalcular los umbrales de presión y batería de las 6 configuraciones existentes una vez
      definidas las unidades reales del dispositivo (ver roadmap, decisiones pendientes).
