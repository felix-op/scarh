import { NextRequest, NextResponse } from "next/server";
import { putServerLimnigrafo, postServerLimnigrafoConfiguracion } from "@services";
import { limnigrafoEditarSchema, handleApiError, parseJsonBody, createRouteLogger } from "@utils";
import type { LimnigrafosPutPayload, ConfiguracionLimnigrafoPayload } from "@models";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: Context) {
  const { id } = await context.params;
  const logger = createRouteLogger(req);

  logger.divider();

  try {
    const parsed = await parseJsonBody(req, limnigrafoEditarSchema);
    logger.success("Schema Zod validado ✓");

    // Descomponer el payload combinado
    const {
      tiempo_advertencia,
      tiempo_peligro,
      bateria_max,
      bateria_min,
      altura_minima_agua,
      altura_maxima_agua,
      temperatura_minima,
      temperatura_maxima,
      presion_minima,
      presion_maxima,
      ...rest
    } = parsed;

    const limnigrafoData: LimnigrafosPutPayload = {
      codigo: rest.codigo,
      descripcion: rest.descripcion,
      ultimo_mantenimiento: rest.ultimo_mantenimiento ?? null,
      tipo_comunicacion: rest.tipo_comunicacion,
      memoria: rest.memoria ?? null,
      radio_cobertura_metros: rest.radio_cobertura_metros ?? null,
      ubicacion_id: rest.ubicacion_id ?? null,
    };

    const configData: ConfiguracionLimnigrafoPayload = {
      tiempo_advertencia: tiempo_advertencia ?? null,
      tiempo_peligro: tiempo_peligro ?? null,
      bateria_max: bateria_max ?? null,
      bateria_min: bateria_min ?? null,
      altura_minima_agua: altura_minima_agua ?? null,
      altura_maxima_agua: altura_maxima_agua ?? null,
      temperatura_minima: temperatura_minima ?? null,
      temperatura_maxima: temperatura_maxima ?? null,
      presion_minima: presion_minima ?? null,
      presion_maxima: presion_maxima ?? null,
    };

    // ── 1. PUT al backend: datos del limnígrafo ──────────────────
    logger.info(`→ PUT backend limnigrafos/${id}/`, limnigrafoData);
    await putServerLimnigrafo({ params: { id }, data: limnigrafoData });
    logger.success("PUT limnígrafo exitoso");

    // ── 2. POST al backend: configuración del limnígrafo ─────────
    logger.info(`→ POST backend limnigrafos/${id}/configuracion/`, configData);
    const config = await postServerLimnigrafoConfiguracion({ params: { id }, data: configData });
    logger.success("POST configuración exitoso");

    return NextResponse.json(config);
  } catch (error) {
    logger.error("Error al procesar la solicitud", error);
    return handleApiError(error);
  }
}
