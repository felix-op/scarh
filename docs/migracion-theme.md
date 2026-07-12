# Tarea 3: Optimización de ThemeProvider y Prevención de Re-renders

## Objetivo
Implementar una solución de cambio de tema extremadamente eficiente que no dependa de estados reactivos globales de React (como un React Context propagando un valor de tema) para evitar re-renders innecesarios en toda la aplicación. El cambio de tema se realizará manipulando directamente el DOM mediante la clase o atributo aplicado a la etiqueta HTML.

---

## 1. Funcionamiento Propuesto

1. **Evitar el Contexto Reactivo**: No se expondrá un estado `theme` (ej. `const [theme, setTheme] = useState('light')`) en un Context Provider que envuelva a toda la aplicación. Si se hiciera esto, cada cambio de tema re-renderizaría todos los componentes hijos, disminuyendo el rendimiento.
2. **Manipulación Directa del HTML**: El cambio de tema ocurrirá de manera imperativa modificando la clase de la etiqueta `<html>` (añadiendo/removiendo `.dark` o `.light`) o modificando el atributo `data-theme`.
3. **Persistencia**: La selección del tema se almacenará en `localStorage` (o cookies para soporte SSR nativo) para recordar la preferencia del usuario en visitas posteriores.
4. **Script Bloqueante Anti-Flash**: Se colocará un pequeño script inline en el `<head>` del documento principal (`layout.tsx`) para leer la preferencia del tema e inyectar la clase correspondiente antes de que el navegador empiece a renderizar el cuerpo del HTML. Esto evita el parpadeo blanco/negro (flash) de carga.

---

## 2. API e Interfaz del ThemeProvider

El nuevo diseño del proveedor del tema sólo debe exponer dos cosas esenciales:

1. **`toggleTheme()`**: Función para cambiar entre tema claro y oscuro. Modifica el atributo de clase de la etiqueta `<html>` y actualiza la preferencia en `localStorage`.
2. **`getTheme()`**: Función o método no reactivo que consulta directamente el atributo del DOM (por ejemplo, `document.documentElement.className` o `document.documentElement.getAttribute('data-theme')`) para saber qué tema está aplicado actualmente en el navegador.

### Estructura Conceptual del Proveedor (Client-Side Utility)

```typescript
// website/app/utils/theme.ts
"use client";

const THEME_KEY = 'theme-preference';

export const getTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  // Leer directamente del DOM
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark' : 'light';
};

export const toggleTheme = (): void => {
  if (typeof window === 'undefined') return;

  const currentTheme = getTheme();
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

  // Aplicar directamente al elemento html sin disparar re-render de React
  if (nextTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }

  localStorage.setItem(THEME_KEY, nextTheme);
  
  // Desencadenar un evento personalizado por si algún componente específico necesita escuchar el cambio de forma asíncrona
  window.dispatchEvent(new Event('theme-change'));
};
```

---

## 3. Prevención de Flash de Renderizado (layout.tsx)

En el archivo base `website/app/layout.tsx`, inyectar un script inline dentro del `<head>` para inicializar el tema de forma síncrona y ultra-rápida:

```tsx
// website/app/layout.tsx
import './styles/global.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme-preference') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.add(theme);
    })();
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```
> [!IMPORTANT]
> Se añade `suppressHydrationWarning` en la etiqueta `<html>` porque el script de inicialización modificará las clases del elemento HTML antes de la hidratación de React, lo que de otra manera causaría un warning en la consola del navegador.
