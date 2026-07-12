# Tarea 2: Modularización de CSS y Adopción de Material Design (Tailwind v4)

## Objetivo
Desacoplar la configuración global de estilos para mejorar la mantenibilidad del código CSS y transicionar hacia un sistema de diseño estructurado bajo los principios de **Material Design**, utilizando variables CSS centralizadas y la directiva `@theme` de **Tailwind CSS v4** directamente en los archivos de estilos, sin necesidad de un archivo de configuración Javascript/Typescript.

---

## 1. Modularización de Archivos CSS

La configuración contenida en el archivo de estilos principal se dividirá en múltiples archivos específicos y organizados para evitar un archivo único difícil de mantener. La estructura sugerida dentro de `website/app/styles/` es:

* **`theme-light.css`**: Contiene la definición de todas las variables CSS (colores, sombras, etc.) específicas para el tema claro bajo la pseudo-clase `:root` o el selector `.light`.
* **`theme-dark.css`**: Contiene la definición de variables CSS para el tema oscuro bajo la clase `.dark`.
* **Component-specific CSS (Opcional)**: En caso de que algún componente requiera estilos CSS puros muy específicos que no se puedan modelar con utilidades de Tailwind, se creará un archivo CSS por componente (ej. `table.css`, `sidebar.css`).
* **`global.css` (Archivo Agregador)**: Importará los archivos anteriores y declarará las directivas estándar de Tailwind v4 junto con la extensión del tema:
  ```css
  @import "tailwindcss"; /* Importación nativa de Tailwind v4 */
  
  @import './theme-light.css';
  @import './theme-dark.css';
  /* Importación de estilos específicos de componentes si existieran */
  
  /* Extensión de Tema nativo de Tailwind v4 */
  @theme {
    --color-primary: var(--color-primary-main);
    --color-primary-light: var(--color-primary-light);
    --color-primary-dark: var(--color-primary-dark);
    --color-primary-disabled: var(--color-primary-disabled);
    --color-primary-contrast: var(--color-primary-contrastText);
  
    --color-success: var(--color-success-main);
    --color-success-light: var(--color-success-light);
    --color-success-dark: var(--color-success-dark);
    --color-success-disabled: var(--color-success-disabled);
    --color-success-contrast: var(--color-success-contrastText);

    --color-error: var(--color-error-main);
    --color-error-light: var(--color-error-light);
    --color-error-dark: var(--color-error-dark);
    --color-error-disabled: var(--color-error-disabled);
    --color-error-contrast: var(--color-error-contrastText);

    --color-warn: var(--color-warn-main);
    --color-warn-light: var(--color-warn-light);
    --color-warn-dark: var(--color-warn-dark);
    --color-warn-disabled: var(--color-warn-disabled);
    --color-warn-contrast: var(--color-warn-contrastText);

    --background-default: var(--background-default);
    --background-paper: var(--background-paper);

    --radius-shape-sm: var(--shape-corner-small);
    --radius-shape-md: var(--shape-corner-medium);
    --radius-shape-lg: var(--shape-corner-large);

    --shadow-card: var(--card-shadow);
    --shadow-card-hover: var(--card-shadow-hover);
  }
  ```

---

## 2. Sistema de Diseño basado en Material Design

Se prohibirá el uso de colores directos (hardcodeados) en clases ad-hoc dentro de los componentes. En su lugar, se implementará un esquema basado en tokens (variables CSS) mapeados a clases utilitarias de Tailwind.

### Tokens de Color (Soporte Multi-estado)
Para cada una de las siguientes paletas semánticas, se deben definir las variables correspondientes en los temas claro y oscuro:
* **Primary** (Color de marca principal)
* **Secondary** (Color de acento secundario)
* **Success** (Estados de éxito o validación)
* **Error** (Estados de error o peligro)
* **Warn** (Estados de advertencia o atención)

Cada paleta debe contar al menos con las siguientes variantes de estado:
* `main`: Color base para el estado normal.
* `light`: Variante más clara (útil para fondos de alertas o estados hover).
* `dark`: Variante más oscura (útil para estados hover u optimizaciones de contraste).
* `disabled`: Color atenuado para representar elementos inactivos.
* `contrastText`: Color del texto que se muestra encima del color `main` garantizando accesibilidad (ej. blanco o negro).

**Ejemplo de declaración CSS en variables (`theme-light.css`):**
```css
:root {
  --color-primary-main: #1976d2;
  --color-primary-light: #42a5f5;
  --color-primary-dark: #1565c0;
  --color-primary-disabled: #90caf9;
  --color-primary-contrastText: #ffffff;

  --color-success-main: #2e7d32;
  --color-success-light: #4caf50;
  /* ... resto de variables ... */
}
```

### Tokens de Estructura y Forma (Shapes & Components)
Se definirán variables CSS para unificar la morfología de la interfaz:
* **Shape (Bordes)**:
  * `--shape-corner-small`: Bordes para inputs y botones pequeños (ej. `4px`).
  * `--shape-corner-medium`: Bordes para cards y botones medianos (ej. `8px`).
  * `--shape-corner-large`: Bordes para modales y paneles contenedores grandes (ej. `16px`).
* **Cards (Tarjetas)**:
  * `--card-background`: Color de fondo de la tarjeta.
  * `--card-shadow`: Sombra de la tarjeta en estado normal.
  * `--card-shadow-hover`: Sombra de la tarjeta al hacer hover.
  * `--card-border`: Color del borde de la tarjeta (si aplica).
* **Inputs (Campos de Formulario)**:
  * `--input-background`: Fondo del campo de texto.
  * `--input-border`: Borde en estado normal.
  * `--input-focus-border`: Borde al enfocar.
  * `--input-text`: Color del texto ingresado.
  * `--input-placeholder`: Color del texto de ayuda.
* **Backgrounds (Fondos de Página)**:
  * `--background-default`: Fondo principal de la aplicación.
  * `--background-paper`: Fondo de elementos sobrepuestos (como sidebars, headers o contenedores).
