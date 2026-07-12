# Tarea 4: Cliente HTTP Server-First (Fetch Nativo)

## Objetivo
Reemplazar por completo el uso de librerías como Axios y TanStack Query (React Query) en favor de una arquitectura basada principalmente en **Server-Side Rendering (SSR)** y Server Components de Next.js. Para ello, se implementará una abstracción ligera sobre el método `fetch` nativo de JavaScript, optimizada para ejecutarse del lado del servidor y gestionar de forma nativa la caché e invalidación de datos de Next.js.

---

## 1. Justificación del Cambio

* **TanStack Query / Axios**: Estas librerías se enfocan en la obtención de datos en el cliente (Client-Side Fetching), lo que añade peso al bundle de Javascript, genera problemas de hidratación en SSR y aumenta la complejidad debido al manejo de estados locales de caché en el cliente.
* **Fetch Nativo en Next.js**: Next.js extiende el `fetch` nativo para proporcionar caché automática, revalidación en base a tiempo o tags y control directo desde Server Components. Esto permite delegar la lógica de obtención de datos al servidor, eliminando layouts pesados en el cliente y mejorando el SEO y tiempo de carga (LCP).

---

## 2. Estructura de Error Estandarizada (`ApiError`)

Para asegurar un manejo robusto de los fallos, cualquier error devuelto por la API o generado en la solicitud debe instanciarse bajo una clase estructurada que exponga las siguientes propiedades:

* **`codigo`**: Identificador único o código de error provisto por el backend (o el código de estado HTTP si el error es de red).
* **`descripcionUsuario`**: Mensaje amigable, claro y traducido, diseñado para ser mostrado directamente en la interfaz de usuario.
* **`descripcionTecnica`**: Detalles técnicos exhaustivos del error (stack trace, mensaje interno, parámetros erróneos) para depuración y almacenamiento en logs.

### Definición de la Clase de Error

```typescript
export class ApiError extends Error {
  public codigo: string | number;
  public descripcionUsuario: string;
  public descripcionTecnica: string;

  constructor(codigo: string | number, descripcionUsuario: string, descripcionTecnica: string) {
    super(descripcionUsuario);
    this.name = 'ApiError';
    this.codigo = codigo;
    this.descripcionUsuario = descripcionUsuario;
    this.descripcionTecnica = descripcionTecnica;
    
    // Capturar stack trace en entornos V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
```

---

## 3. Abstracción Propuesta (`apiClient`)

Se creará una función utilitaria en el servidor para realizar peticiones HTTP tipadas. Soporta headers personalizados de `Content-Type` y diferentes formatos de salida (JSON, Blob para binarios, Texto, ArrayBuffer).

### Diseño Conceptual de la Abstracción

```typescript
// website/app/services/apiClient.ts
import { cookies } from 'next/headers';
import { ApiError } from '../models/model.errores'; // O donde se decida exportar

interface RequestOptions extends RequestInit {
  tags?: string[];
  revalidate?: number | false;
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  // Recuperar token de sesión en servidor
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const headers = new Headers(options.headers);
  
  // Establecer Content-Type por defecto si no se especificó uno personalizado
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Inyectar token de sesión solo si no se pasó un header de Authorization personalizado
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Configuración de la caché nativa de Next.js 15/16
  const nextConfig: Record<string, any> = {};
  if (options.tags) nextConfig.tags = options.tags;
  if (options.revalidate !== undefined) nextConfig.revalidate = options.revalidate;

  const config: RequestInit = {
    ...options,
    headers,
    next: {
      ...options.next,
      ...nextConfig,
    }
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (netError: any) {
    // Error de red / DNS / Conexión
    throw new ApiError(
      'NETWORK_ERROR',
      'No se pudo establecer conexión con el servidor. Por favor, verifica tu conexión a internet.',
      netError.message || String(netError)
    );
  }

  // Manejo de errores devueltos por el servidor (respuestas HTTP no exitosas)
  if (!response.ok) {
    let errorPayload: any = {};
    try {
      errorPayload = await response.json();
    } catch {
      // Si no es un JSON, intentamos obtener el texto plano
      try {
        errorPayload.descripcionTecnica = await response.text();
      } catch {
        errorPayload.descripcionTecnica = 'No se pudo leer el cuerpo de la respuesta de error.';
      }
    }

    throw new ApiError(
      errorPayload.codigo || response.status,
      errorPayload.descripcionUsuario || 'Ocurrió un error inesperado al procesar la solicitud.',
      errorPayload.descripcionTecnica || `Error HTTP ${response.status}: ${response.statusText}`
    );
  }

  // Parsear la respuesta exitosa según el formato solicitado (responseType)
  const responseType = options.responseType || 'json';
  
  switch (responseType) {
    case 'blob':
      return (await response.blob()) as unknown as T;
    case 'text':
      return (await response.text()) as unknown as T;
    case 'arraybuffer':
      return (await response.arrayBuffer()) as unknown as T;
    case 'json':
    default:
      return (await response.json()) as Promise<T>;
  }
}
```

---

## 4. Ejemplos de Uso

### A. Solicitar Archivo Binario (Ej: PDF o Excel)
```typescript
// website/app/services/reportes.ts
import { apiClient } from './apiClient';

export async function descargarReporteLimnigrafo(id: string): Promise<Blob> {
  return apiClient<Blob>(`/reportes/limnigrafos/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf',
      'Content-Type': 'application/pdf', // Content-Type específico
    },
    responseType: 'blob', // Solicita tipo binario (Blob)
    cache: 'no-store'
  });
}
```

### B. Obtención de Datos de la API e Invalidación
1. **Obtención de Datos (Server Component)**:
   ```tsx
   // website/app/(pages)/limnigrafos/page.tsx
   import { apiClient } from '@/services/apiClient';
   
   export default async function LimnigrafosPage() {
     const datos = await apiClient<Limnigrafo[]>('/limnigrafos', {
       tags: ['limnigrafos'],
       cache: 'force-cache'
     });
     
     return <LimnigrafoList data={datos} />;
   }
   ```

2. **Modificación de Datos e Invalidación (Server Action)**:
   ```typescript
   // website/app/services/actions.ts
   'use server';
   
   import { apiClient } from '@/services/apiClient';
   import { revalidateTag } from 'next/cache';
   
   export async function crearLimnigrafo(nuevoDato: Omit<Limnigrafo, 'id'>) {
     await apiClient('/limnigrafos', {
       method: 'POST',
       body: JSON.stringify(nuevoDato),
     });
     
     revalidateTag('limnigrafos');
   }
   ```
