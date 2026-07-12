# Sistema de Diseño: Material Design

Este documento define la escala de formas (bordes redondeados) y la paleta de colores semánticos globales del proyecto, eliminando estilos ad-hoc por componentes.

---

## 1. Escala de Formas (Shapes)

El redondeo de las esquinas se asigna según el tamaño y la jerarquía del contenedor para mantener consistencia física:

* **Small (`--shape-corner-small` / `4px`)**:
  * *Uso*: Componentes atómicos de control (checkboxes, tooltips, switches).
* **Medium (`--shape-corner-medium` / `8px`)**:
  * *Uso*: Elementos interactivos principales y de formularios (botones, inputs, textfields, tarjetas pequeñas).
* **Large (`--shape-corner-large` / `12px`)**:
  * *Uso*: Contenedores flotantes y paneles grandes (ventanas modales, sidebars, popovers).
* **Full (`--shape-corner-full` / `9999px`)**:
  * *Uso*: Píldoras visuales y elementos circulares puros (avatares, botones de icono, sliders).

---

## 2. Paleta de Colores Semánticos

Se prohíbe definir colores específicos para componentes en el CSS local. Se debe utilizar la paleta semántica global con sus correspondientes variantes de estado:

* **Primary**: Color de marca principal e interactividad primaria.
* **Secondary**: Color de acento para interacciones secundarias.
* **Success**: Validaciones, operaciones exitosas y confirmaciones.
* **Error**: Alertas críticas, destrucción de datos y fallos.
* **Warn**: Advertencias, estados preventivos o intermedios.
* **Default**: Elementos neutrales, deshabilitados o secundarios sin carga de estado.

### Variantes de Estado obligatorias:
* `main`: Color base para el estado normal.
* `light`: Fondo para alertas o estados en hover tenue.
* `dark`: Para hover de alto contraste o énfasis.
* `disabled`: Color atenuado para inactividad.
* `contrastText`: Color del texto legible sobre el color `main` (blanco o negro).

---

## 3. Uso de Componentes (Guía de Referencia)

Sección reservada para documentar las condiciones de uso de cada componente:

### `Boton` / `BotonIcono`
* *Cuándo usar*: Para desencadenar acciones en la UI.
* *Variantes*: 
  * `BotonGuardar`/`BotonConfirmar` -> variant `success` (Confirmar es outlined por defecto).
  * `BotonEliminar`/`BotonCancelar` -> variant `error` (Cancelar es outlined por defecto).
  * `BotonLogin`/`BotonPassword` -> variant `primary`.
  * `BotonFiltro`/`BotonVolver`/`BotonVerMas` -> variant `default`.
  * `BotonIcono` -> exclusivamente para acciones compactas sin etiqueta de texto.

### `Card` / `Paper`
* *Cuándo usar*: Para agrupar contenidos relacionados.
* *Variantes*:
  * `Paper` -> contenedor base plano de fondo sin sombra.
  * `Card` -> contenedor con sombra estática o animada (`animated: true`) para resaltar sobre el fondo.
  * `CardStatus` -> contenedor con borde coloreado en una dirección (`left`, `top`, `right`, `bottom`) para indicar estados semánticos (`success`, `error`, `warning`, `info`).

---

## 4. Sistema de Tipografía y Escala de Texto

La aplicación utiliza la tipografía **Outfit** como fuente única de marca. Para lograr accesibilidad y consistencia visual, no se deben hardcodear tamaños fijos en píxeles. En su lugar, se utilizan unidades relativas `rem` y se altera dinámicamente la escala base desde el `ThemeProvider` afectando a toda la interfaz proporcionalmente.

### Clasificación de Textos y Títulos (Material Design)

* **Display / Headline Large (H1)**
  * *Clases sugeridas*: `text-3xl font-bold tracking-tight text-foreground-title`
  * *Uso*: Título principal de la página o vista (máximo uno por pantalla para SEO).
* **Headline Medium / Small (H2)**
  * *Clases sugeridas*: `text-2xl font-semibold text-foreground-title`
  * *Uso*: Títulos de secciones principales dentro de la misma página.
* **Title Large / Medium (H3)**
  * *Clases sugeridas*: `text-xl font-semibold text-foreground`
  * *Uso*: Títulos de tarjetas grandes (cards) o subapartados clave.
* **Title Small (H4)**
  * *Clases sugeridas*: `text-lg font-medium text-foreground`
  * *Uso*: Títulos de listas, agrupaciones de datos o subsecciones pequeñas de tarjetas.
* **Body Large / Medium (`<p>`, spans, labels)**
  * *Clases sugeridas*: `text-base text-foreground`
  * *Uso*: Texto de lectura continuo, párrafos informativos, textos de botones.
* **Body Small / Label (`<span>`, captions)**
  * *Clases sugeridas*: `text-sm text-text-secondary`
  * *Uso*: Descripciones secundarias, pies de foto, fechas, labels de campos de entrada o estados inhabilitados.

### Mecanismo de Escala de Texto

Al cambiar la escala de texto en el `ThemeProvider` (`small`, `medium`, `large`, `xlarge`), se reconfigura el `font-size` del elemento raíz `<html>` en el DOM:

* **`small`**: `14px` (reduce el tamaño general un 12.5%).
* **`medium`**: `16px` (tamaño estándar del navegador).
* **`large`**: `18px` (aumenta el tamaño general un 12.5%).
* **`xlarge`**: `20px` (aumenta el tamaño general un 25%).

Al usar exclusivamente clases utilitarias de tamaño de Tailwind (que utilizan `rem` de forma interna), todos los elementos y componentes del sistema escalan de forma unificada sin requerir re-renderizados de React.

