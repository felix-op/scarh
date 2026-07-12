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
