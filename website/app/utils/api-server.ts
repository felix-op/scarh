import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@models";

/**
 * Maneja excepciones comunes en Route Handlers (ZodError, ApiError, Error genérico)
 * y devuelve un NextResponse.json con el status y mensaje apropiados.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof z.ZodError) {
    const mensaje = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.descripcionUsuario },
      { status: Number(error.codigo) || 500 }
    );
  }
  const msg = error instanceof Error ? error.message : "Error interno";
  return NextResponse.json({ error: msg }, { status: 500 });
}

/**
 * Intenta parsear el body JSON del request y opcionalmente validarlo con un schema de Zod.
 * Lanza errores que pueden ser atrapados por `handleApiError`.
 */
export async function parseJsonBody<T>(req: NextRequest, schema?: z.ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new Error("Body inválido: se esperaba JSON.");
  }

  if (schema) {
    return schema.parse(body);
  }
  return body as T;
}

/**
 * Crea utilidades de logging estandarizadas con prefijo para el route handler actual.
 */
export function createRouteLogger(req: NextRequest) {
  const prefix = `[${req.method} ${req.nextUrl.pathname}]`;
  return {
    info: (msg: string, data?: any) => 
      console.log(`${prefix} ${msg}`, data ? JSON.stringify(data, null, 2) : ""),
    success: (msg: string) => 
      console.log(`${prefix} ✓ ${msg}`),
    error: (msg: string, err?: any) => 
      console.error(`${prefix} ✗ ${msg}`, err ? err : ""),
    divider: () => 
      console.log(`\n${prefix} ── Solicitud recibida`),
  };
}
