# Roadmap de Estadísticas

La pantalla `/dashboard/estadisticas` está funcionando con tres vistas —Gráficos,
Comparar dispositivos y Resumen por período—, filtros en la URL, exportación a CSV y
las series alimentadas por `/medicion/serie/` con agrupación automática en el servidor.

El tablero de inicio (`/dashboard`) también está terminado: estado de la flota, totales
de la instalación con la dona de origen de cargas, y las últimas acciones del sistema.

Queda esto.

---

## 1. Exportación a Excel

- [ ] Endpoint `/estadisticas/exportar?tipo=excel` en Django, con los mismos filtros que
      `/estadisticas/tabla/`, usando `openpyxl`.
- [ ] Extender `MenuExportar` (`website/app/components/menu-exportar.tsx`) para apuntar
      a ese endpoint.

**Antes de implementarlo, ver `requerimientos/actualizar_requerimientos.md`:** la
propuesta es quitar Excel del requerimiento, porque el CSV que ya se exporta lleva BOM
UTF-8 y separador `;`, así que abre en Excel con doble clic. Un `.xlsx` de verdad sólo
agregaría formato, y para una tabla de diez filas eso no habilita ninguna tarea nueva.

Si el cliente igual lo pide, va en el backend: en el navegador la librería cuesta entre
600 kB y 1 MB de bundle (ver `Rules.md` §9).

## 2. Comparar dos rangos de fechas entre sí

- [ ] Es el hueco funcional real de RF [4.02]: hoy se puede comparar varios limnígrafos
      en un mismo rango, y varios períodos de un mismo limnígrafo, pero no dos rangos
      arbitrarios lado a lado —mayo 2025 contra mayo 2026—.

      Es la funcionalidad más costosa que queda del módulo. **Conviene mostrarle al
      cliente lo implementado antes de construirla**: puede que el resumen por período
      ya le responda la pregunta.

## 3. Filtro por origen de carga

- [ ] Ver la entrada en `deuda-tecnica.md`. Prioridad baja, y el backend ya lo soporta.

## 4. Verificación contra la implementación anterior

- [ ] Contrastar los valores de la pantalla nueva contra los de la anterior sobre el
      mismo rango y el mismo limnígrafo.

      **El desvío estándar debe diferir**, y eso es correcto: el backend lo calcula
      muestral (divide por n-1) y la pantalla anterior lo hacía poblacional (divide por
      n) en la pestaña de gráficos, por lo que mostraba números distintos según la
      pestaña para el mismo dato. Ahora hay una sola definición.

      El resto de las métricas —mínimo, máximo, mediana, moda, percentil 90— tiene que
      coincidir.

---

## Decisiones tomadas, para no volver a discutirlas

**La agregación se calcula en memoria de Python, no en la base.** Está evaluado,
medido y postergado a propósito, con condición de disparo escrita en
`deuda-tecnica.md`. Resumen: con la flota proyectada el volumen no lo justifica todavía,
y el modo de falla de esa refactorización es devolver números equivocados en silencio,
que se detecta mejor con datos reales de un año que con los pocos que hay hoy.

**No hay tarjetas de estadísticas descriptivas arriba de los gráficos.** Los mismos
números son las columnas de la tabla comparativa. La división es deliberada: la tabla
responde "qué valores tuvo" y el gráfico "cuándo pasó algo". Lo que sí hay es una tira
compacta por gráfico, alimentada por el mismo endpoint que la tabla para que los dos
lugares no puedan mostrar cifras distintas de lo mismo.

**Los huecos de medición no se sombrean.** La línea cortada
(`connectNulls={false}`) más la cobertura en el encabezado —"cobertura 94 % · 2
interrupciones"— alcanzan. El sombreado con `ReferenceArea` exige calcular las corridas
contiguas de nulos y con varios cortes deja el gráfico a rayas.

**Más de tres series superpuestas no se distinguen sólo por color.** Ningún orden de
ocho hues pasa el criterio estricto de separación para daltonismo con todos los pares
en pantalla a la vez. Por eso la vista por filas es la predeterminada, el modo
superpuesto es opcional, y con cuatro o más aparece un aviso que remite a la leyenda y
al tooltip.
