# Persistencia temporal de limnígrafos

> ⚠️ Este documento describe la capa intermedia que agregamos para simular una base de datos **solo en el frontend**. Se puede eliminar cuando el proyecto se conecte al backend real.

## Archivos involucrados

- `shared/data/limnigrafosStore.json`  
  - JSON plano que actúa como “base de datos”.  
  - Estructura: `{ "limnigrafos": [...], "mediciones": { "<id>": [ ... ] } }`.

- `shared/lib/limnigrafoStore.ts`  
  - Helpers para leer/escribir el JSON usando `fs`.  
  - Se asegura de inicializar el archivo con los datos mock (`LIMNIGRAFOS`) si está vacío.

## Endpoints temporales (Next.js API)

- `GET /api/limnigrafos` → devuelve `{ limnigrafos, mediciones }`.  
- `POST /api/limnigrafos` → persiste un limnígrafo nuevo (body `{ limnigrafo }`).  
- `DELETE /api/limnigrafos` → elimina por `id`.  
- `GET /api/limnigrafos/:id/mediciones` → lista registros del limnígrafo.  
- `POST /api/limnigrafos/:id/mediciones` → reemplaza las mediciones del limnígrafo (body `{ mediciones }`).

## Páginas que usan el archivo

- `app/(pages)/limnigrafos/page.tsx`  
  - Al crear un limnígrafo llama a `POST /api/limnigrafos` y después lo refleja en UI.

- `app/(pages)/limnigrafos/importarDatos/page.tsx`  
  - Importa mediciones manuales/JSON y las guarda con `POST /api/limnigrafos/:id/mediciones`.

- `app/(pages)/mediciones/page.tsx`  
  - Lee `GET /api/limnigrafos` para mostrar los datos reales (usa mocks como fallback si el archivo está vacío).

## Pasos para reemplazar por backend real

1. Implementar las mismas operaciones en el servicio/backed oficial.
2. Actualizar las llamadas `fetch("/api/limnigrafos...")` en las páginas mencionadas para que apunten al backend.
3. Eliminar:
   - `shared/data/limnigrafosStore.json`
   - `shared/lib/limnigrafoStore.ts`
   - `app/api/limnigrafos/**`
   - Este README.

Mientras tanto, se puede seguir editando el JSON manualmente o borrarlo para reinicializar la data dummy.
