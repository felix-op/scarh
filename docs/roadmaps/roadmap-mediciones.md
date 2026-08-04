# Roadmap de Mediciones

## Estado actual

El histórico funciona: listado paginado por SSR, responsive, con filtros por limnígrafo,
fuente, ventana de tiempo y búsqueda, y exportación a CSV y JSON.

La importación tiene la pantalla dedicada (`/dashboard/limnigrafos/importar/[id]`), el
área de arrastrar y soltar, el selector de limnígrafo, el parseo local sin dependencias
externas (`utils/mediciones.utiles.ts` + `mediciones.schemas.ts`) y **el formato viejo
soportado de punta a punta**.

Del lado del backend existen `validate-import` (devuelve el reporte fila por fila) y
`bulk-import` (hace el commit).

**El frontend nunca crea mediciones individuales.** No interactúa con los endpoints de
recepción en tiempo real: esos son para los dispositivos. La única entrada por interfaz
es la importación masiva; el listado es de sólo lectura.

---

## 1. Importación del formato nuevo

Es el pendiente principal. El formato nuevo es el que **exporta la propia plataforma**,
con una o varias mediciones de uno o varios dispositivos.

El backend ya lo acepta: `MedicionImportRowSerializer` tiene `limnigrafo_id` opcional
**por fila**, y el payload tiene `fallback_limnigrafo_id` para cuando las filas no lo
traen. O sea que multi-dispositivo está soportado a nivel de contrato.

### El problema: lo que exporta mediciones no se puede reimportar

Verificado en `components/mediciones/tabla-mediciones.tsx`. El ida y vuelta está roto en
cuatro puntos, y hay que decidir en cada uno si se arregla el exportador, el importador,
o los dos:

| Campo | Qué exporta | Qué espera el importador |
|---|---|---|
| Limnígrafo | el **código** (`LM-RIO-OLIVIA-01`), o el literal `ID 4` si no lo encuentra | `limnigrafo_id` numérico |
| Fecha y hora | `dd/MM/yyyy HH:mm` | `parse_datetime` de Django, que espera **ISO** |
| Fuente | la **etiqueta** (`Automático`) | el valor (`automatico`) — y de hecho la reescribe como `import_csv` |
| Encabezados | con unidad: `Nivel del agua (cm)` | nombres de campo |

El JSON sí round-trippea mejor: `exportarComoJSON` volca los `MedicionResponse` en
crudo, donde `limnigrafo` es el ID numérico y `fecha_hora` es ISO.

- [ ] Decidir la estrategia. Dos caminos, y conviene elegir uno antes de escribir código:
      - **Exportar un formato reimportable**: agregar la columna de ID (o exportar el
        código y que el importador lo resuelva contra el listado que ya tiene en
        memoria), fecha en ISO y `fuente` con su valor. El costo es que el CSV se vuelve
        menos legible para un humano en Excel, que es su otro uso.
      - **Dos exportaciones distintas**: una "para leer" (la actual) y otra "para
        reimportar". Más honesto, pero duplica la salida.
- [ ] Que el importador resuelva **código → ID** contra el diccionario de limnígrafos.
      El plan original asumía una columna de ID y un `limnigrafoCodeById` para mostrar;
      hace falta el mapa inverso.
- [ ] Normalizar la fecha antes de enviarla: el parseador local tiene que convertir
      `dd/MM/yyyy HH:mm` a ISO, porque `normalizar_fecha_importacion` no acepta el
      formato local.
- [ ] **Probarlo contra el backend de punta a punta** con un archivo exportado por la
      propia plataforma: uno de un solo dispositivo y otro de varios. Es la prueba que
      confirma si el contrato realmente cierra.

### Reglas de asignación del limnígrafo

Ya definidas, se mantienen:

- Formato **viejo** → el usuario elige obligatoriamente un limnígrafo de destino.
- Formato **nuevo sin columna de limnígrafo** → también elige obligatoriamente.
- Formato **nuevo con columna de limnígrafo** → se muestra el código en la tabla. Puede
  venir preseleccionado por query param (`?limnigrafo=ID`) cuando el usuario llega desde
  la ficha de un dispositivo.

---

## 2. Partir el endpoint de importación en tres

Hoy `validate-import` y `bulk-import` son síncronos: el request se queda esperando
mientras Django procesa el lote completo. Con miles de filas eso bloquea la pantalla, se
come un worker entero y puede chocar contra el timeout del proxy.

- [ ] `POST /importacion/validar` — recibe el lote, **devuelve de inmediato** un
      identificador de trabajo y valida en segundo plano.
- [ ] `POST /importacion/guardar` — confirma un trabajo ya validado y hace el commit,
      también en segundo plano.
- [ ] `POST /importacion/consultar` — estado del trabajo: en cola, procesando (con
      porcentaje), terminado con el reporte, o fallado.

Lo que habilita:

- El frontend **deja de estar bloqueado**: se puede navegar a otra pantalla mientras
  valida y volver a ver el resultado.
- **Barra de progreso real**, porque el trabajo informa cuántas filas procesó.
- **Procesamiento por tandas**, que acota la memoria y permite limitar los recursos que
  el lote le saca a la base o a Django. Hoy un archivo grande entra entero en RAM.

### Decisión de diseño previa

`consultar` implica que el trabajo **se persiste**: hace falta un modelo (`ImportacionLote`
o similar) con estado, progreso, el reporte de validación y una expiración, porque los
lotes validados y nunca confirmados hay que limpiarlos.

Y hace falta decidir **quién ejecuta el trabajo**. El proyecto no tiene Celery ni una
cola. Las opciones, de menor a mayor infraestructura:

1. **Procesar por tandas en la propia consulta**: cada `consultar` avanza un bloque de N
   filas y devuelve el progreso. Cero infraestructura nueva, pero el avance depende de
   que el cliente siga preguntando.
2. **Un hilo o proceso lanzado desde el request**. Simple, pero se pierde si el worker se
   reinicia y no escala a varios workers.
3. **Un management command periódico**, como el que ya corre `generar_alerta` cada
   minuto. Consistente con lo que existe, con la latencia de un minuto como techo.
4. **Celery + Redis**. Es la respuesta correcta a escala, y es infraestructura nueva.

Con el volumen de este sistema, la 3 parece el mejor cambio de escalón: reusa un
mecanismo que ya está en producción.

---

## 3. Optimizar la validación de duplicados

- [ ] Hoy la validación de duplicados arma **una consulta con un `OR` por fila**:
      `Q(limnigrafo_id=X, fecha_hora=Y) | Q(limnigrafo_id=X, fecha_hora=Z) | …`
      Con miles de registros, la base se sobrecarga sólo armando el plan de ejecución.

      La estrategia acordada aprovecha que las mediciones importadas caen en un rango
      temporal continuo:

      1. Sacar el mínimo y el máximo de `fecha_hora` del lote, en memoria.
      2. Una sola consulta pidiendo **sólo la columna `fecha_hora`** de ese rango:
         `WHERE limnigrafo_id IN (…) AND fecha_hora BETWEEN min AND max`.
      3. Volcar el resultado en un `set` de Python.
      4. Validar cada fila con un `in` sobre el set, que es tiempo constante.

      Con multi-dispositivo el set tiene que ser de tuplas `(limnigrafo_id, fecha_hora)`,
      no de fechas sueltas: dos sensores pueden tener la misma marca de tiempo y no son
      duplicados entre sí.

Un detalle que la previsualización tiene que cubrir: `bulk_create` corre **sin**
`ignore_conflicts`, y `Medicion` tiene una restricción de unicidad sobre
`(limnigrafo, fecha_hora)`. Una fecha ya cargada **aborta la transacción completa** con
un error, no se saltea en silencio. Detectar el duplicado antes del commit no es una
mejora de experiencia, es lo que evita que el guardado falle entero.

---

## 4. Componentes de importación pendientes

En `components/mediciones/`. Los otros cinco ya están hechos: selector de archivo,
selector de limnígrafo, chip de estado, acciones y ventana de eliminación.

- [ ] `ventana-editar-medicion.tsx` — editar una fila que falló la validación, sin
      volver a subir el archivo.
- [ ] `ventana-confirmar-guardado.tsx` — el diálogo de "hay 50 registros que ya existen,
      ¿los ignoro e importo el resto?".
- [ ] `configuraciones-tabla.tsx` — definiciones de columnas por formato (viejo / nuevo).
      Las columnas son fijas por formato, no derivadas de `Object.keys()`.
- [ ] `tabla-mediciones-importacion.tsx` — la tabla con edición y selección de
      configuración de columnas.

Y los filtros rápidos de la tabla: *Todas*, *Listas para subir*, *Con errores de
formato*, *Duplicadas*.

### Flujo de guardado acordado

Un solo botón **"Importar datos"**, no uno de validar y otro de confirmar. Según lo que
responda el backend:

- **Todo bien** → se guarda, se notifica y se limpia la tabla.
- **Sólo duplicados** → se detiene y pregunta si ignorarlos e importar el resto.
- **Errores bloqueantes** → no se guarda nada y las filas culpables quedan marcadas en
  rojo con el motivo, para corregirlas o borrarlas ahí mismo.

---

## 5. Exportación global de la tabla

- [ ] La exportación actual pagina el endpoint desde el navegador y avisa cuando trunca
      (`obtenerTodasLasMedicionesFiltradas`). Para rangos largos —un año de la flota
      completa es del orden del millón de filas— eso no escala.

      Mismo criterio que en `roadmap-estadisticas.md`: si hace falta un formato con
      formato, va por endpoint de Django.

---

## 6. Endpoints de recepción (backend)

Ninguno toca el frontend.

- [ ] **Endpoint inseguro (legacy / pruebas)**: recibe sólo `fecha_hora` y `altura`, y
      asigna la medición a un dispositivo de prueba fijo. Existe para el hardware viejo
      que no maneja tokens.
- [ ] **Endpoint seguro**: recibe mediciones autenticadas con el token de acceso del
      limnígrafo. Es el que habilita el punto 1 de `roadmap-limnigrafos.md`.

---

## Unidades

Las mediciones se expresan tal como las reporta el equipo: **altura en centímetros** con
un decimal, **batería en volts**, **temperatura en °C** y **presión hidrostática relativa
en hPa** (del orden de 0 a 200, no presión atmosférica).

Todo el formateo pasa por `formatearMedicion()` en
`website/app/utils/mediciones.formato.ts`, que es la única fuente de las unidades. No
escribir la unidad a mano en un componente.

Los umbrales de las `ConfiguracionLimnigrafo` cargadas siguen en las unidades viejas
—altura pensada en metros, presión en el orden de 950–1050— y hay que recalcularlos.
Ver `deuda-tecnica.md`.
