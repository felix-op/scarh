/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { ApiError } from "@models";

type HandlerContext = {
  params?: Promise<Record<string, string>>;
};

export function createHandler<TQuery = any, TBody = any, TRoute = any, TReturn = any>({
  action,
  schema,
}: {
  action: (_args: any) => Promise<TReturn>;
  schema?: ZodSchema<TBody>;
}) {
  return async function (req: NextRequest, context: HandlerContext) {
    try {
      // 1. Extraer queryParams
      const queryParams: Record<string, string> = {};
      req.nextUrl.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      // 2. Extraer Route Params
      let routeParams: Record<string, string> | undefined = undefined;
      if (context?.params) {
        routeParams = await context.params;
      }

      // 3. Extraer Body — elige el content-type igual que RequestSSR:
      //    multipart/form-data se reenvía tal cual (archivos); el resto se parsea como JSON.
      let body: any = undefined;
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
          body = await req.formData();
        } else {
          try {
            body = await req.json();
          } catch {
            body = {};
          }

          // Validar si hay schema (sólo aplica a payloads JSON)
          if (schema) {
            body = schema.parse(body);
          }
        }
      }

      // 4. Ejecutar acción
      const data = await action({
        queryParams: Object.keys(queryParams).length > 0 ? (queryParams as unknown as TQuery) : undefined,
        data: body,
        params: routeParams as unknown as TRoute,
      });

      if (data === undefined) {
        return new NextResponse(null, { status: 204 });
      }

      return NextResponse.json(data);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors.map(e => e.message).join(", ") },
          { status: 400 }
        );
      }
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.descripcionUsuario },
          { status: Number(error.codigo) || 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  };
}
