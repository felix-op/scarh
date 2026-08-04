# Roadmap del Mapa

La pantalla `/dashboard/mapa` está funcionando: primitivas de Leaflet, marcadores con
color por estado, card de detalle, menú contextual, panel con buscador y los tres
filtros (ubicación / conexión / medición), controles de pantalla completa,
satélite/claro y limpio/lista, y alta, edición y borrado de ubicaciones persistidas.

Queda esto.

---

## 1. Ordenar los limnígrafos por criticidad

- [ ] La lista lateral muestra los limnígrafos en el orden que devuelve el backend (por
      `id`). Debería poner primero lo que necesita atención: **sin conexión → demorados
      → resto**.

      Ya existe `ordenarPorCriticidad()` en `website/app/utils/limnigrafos.estado.ts`,
      escrita para el tablero de inicio. Antes de reusarla hay que decidir si el
      criterio sirve igual: el tablero combina estado de conexión **y** de medición en
      una sola escala, y el mapa hoy sólo mira la conexión.

      Ojo con un efecto que ya evitamos en el tablero: a igual criticidad el desempate
      tiene que ser estable (por código), o cada actualización reacomoda la lista y se
      pierde la referencia espacial.

## 2. Quitar dependencias que no se usan

- [ ] `leaflet-draw` y `leaflet.fullscreen` están en `website/package.json` y **no se
      usan en ningún lado**: la pantalla completa se implementó con la API nativa del
      navegador (`document.fullscreenElement`, en `mapa-screen.tsx`) y de dibujo no hay
      nada. Son dos paquetes que viajan al bundle para nada.

      Desinstalarlos y verificar que el build siga pasando.

## 3. Renombrar `components/mapa-legacy/`

- [ ] El nombre miente: **es la implementación actual**. `(pages)/dashboard/mapa/page.tsx`
      importa `MapaDynamic` de esa carpeta. Alguien va a asumir que es código a borrar.

      Contiene `mapa-screen.tsx` (la vista completa), `leaflet-primitivas.tsx` (los
      wrappers de Leaflet), `mapa-dynamic.tsx` (el import dinámico sin SSR) y los
      componentes de lista y sidebar.

      El nombre `mapa/` ya está ocupado por los componentes de dominio
      (card de detalle, menú, panel, ventanas de ubicación), así que hay que decidir
      cómo se reparten. Una opción: las primitivas de Leaflet a `components/ui/mapa.tsx`
      —que es donde el plan original las quería, junto al resto de la presentación
      pura— y el resto fundido en `components/mapa/`.

## 4. Colores de marcador en tokens

- [ ] `mapa-screen.tsx` tiene cuatro colores en crudo (`#82d987`, `#facc15`, `#ef4444`,
      `#9ca3af`), lo que incumple `Rules.md` §3.

      Tiene una atenuación real: van a un ícono SVG de marcador de Leaflet, no a una
      clase de Tailwind. Pero se resuelven leyendo variables CSS, como se hizo en los
      gráficos de estadísticas.

      Son colores de **estado**, así que corresponden los tokens reservados
      (`--color-success`, `--color-warn`, `--color-error`, `--color-foreground-disabled`)
      y no la paleta categórica de gráficos.

---

## Lo que ya está resuelto y conviene no volver a discutir

**La excepción de conexión por tipo de comunicación** está implementada y bien
(`getColorMarcador` en `mapa-screen.tsx`): un limnígrafo sin cobertura de alertas —que
sólo se descarga por USB— aparece en gris neutro cuando está sin conexión, no en rojo.
Estar sin conexión es su modo normal de operar, y marcarlo como falla sería un falso
positivo permanente.
