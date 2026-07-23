# Plan de Migración a Next.js 16 (Carpeta Website)

Este documento detalla la hoja de ruta y la estructura de tareas para migrar el proyecto frontend actual a una arquitectura basada en **Next.js 16** dentro del directorio `website/app`. 

El objetivo es modernizar la arquitectura, mejorar el rendimiento utilizando Server-Side Rendering (SSR) y Server Components de forma mayoritaria, estandarizar el sistema de estilos con variables de Material Design, optimizar la gestión del tema y agilizar el desarrollo a través de un CLI personalizado.

---

## Tabla de Tareas

A continuación se listan las tareas clave de la migración con su estado actual de avance. Para ver las especificaciones técnicas completas y los detalles de implementación de cada una, haz clic en el enlace correspondiente:

| # | Tarea | Objetivo | Estado | Detalle |
|---|---|---|---|---|
| 1 | **Reorganización de Componentes** | Mover los componentes de `shared/componentes` a `app/components` bajo una estructura estricta y clasificada, aislando los componentes genéricos de los de dominio. | 🟡 En Progreso | [Ver especificación](./migracion-componentes.md) |
| 2 | **Modularización de CSS y Material Design** | Separar `global.css` en múltiples archivos específicos y aplicar variables de diseño basadas en la especificación de Material Design utilizando Tailwind v4. | 🟢 Realizada | Documentación consumida e integrada en `styles/` |
| 3 | **Optimización de ThemeProvider** | Implementar un cambio de tema eficiente mediante la alteración directa del HTML en el DOM, previniendo re-renders masivos en cascada. | 🟢 Realizada | Documentación consumida e integrada en `services/provider.theme.tsx` |
| 4 | **Cliente HTTP Server-First (Fetch)** | Crear una abstracción sobre `fetch` nativo para llamadas desde el servidor con revalidación e invalidación de caché, eliminando Axios y TanStack Query. | 🟢 Realizada | [Ver guía de uso](./fetch.md) |
| 5 | **CLI de Generación y Auto-registro** | Desarrollar una herramienta CLI que cree archivos en carpetas específicas y actualice de forma automatizada los exportadores de tipo "barrel" (`index.ts`). | 🟡 En Progreso | [Ver especificación](./migracion-cli.md) |

---

## Consideraciones Generales

1. **Server Components por Defecto**: Todos los componentes y páginas nuevos en la carpeta `website` deben crearse como Server Components por defecto. Solo se debe utilizar la directiva `"use client"` cuando sea estrictamente necesario para interactuar con APIs del cliente (eventos, hooks de estado local o efectos).
2. **Uso Híbrido de SSR y Cliente**: A lo largo de la migración se debe priorizar Server-Side Rendering (SSR) para la obtención inicial de datos y un Time To Interactive (TTI) rápido. Sin embargo, para comportamiento reactivo complejo (como envíos de formularios, encadenamiento de requests, invalidación de caché local o mensajes toast), se permite y fomenta el uso de TanStack Query y Axios. Quedan obsoleto forzar fetch para interacciones netamente de cliente.
3. **Preservación de Lógica**: La migración es estructural y de arquitectura. Se debe conservar la lógica de negocio y las funcionalidades existentes en el frontend original.
