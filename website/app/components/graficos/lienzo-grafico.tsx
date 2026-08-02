"use client";

import type { ReactNode } from "react";
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "../ui/cards";
import { InfoTooltip } from "../ui/info-tooltip";

/**
 * Marco común de los gráficos: encabezado, altura y ejes con estilo del sistema.
 *
 * Existe en lugar del `ui/chart.tsx` de shadcn por dos razones: ese wrapper está
 * escrito para recharts 2 (cambiaron props de `Tooltip` y `Legend`, y se quitaron
 * los `defaultProps` que tiraban warnings con React 19), y resuelve los colores con
 * hex crudos, que Rules §3 prohíbe. Acá todo sale de tokens semánticos.
 *
 * @property {string} titulo Qué muestra el gráfico.
 * @property {string} [subtitulo] Resolución y cobertura, normalmente.
 * @property {ReactNode} [aclaracion] Texto de `info-tooltip` junto al título.
 * @property {ReactNode} [acciones] Contenido alineado a la derecha del encabezado.
 * @property {ReactNode} [resumen] Tira de estadísticas, debajo del encabezado.
 * @property {number} [altura] Alto del área de dibujo en píxeles.
 * @property {ReactNode} children Contenido del `ResponsiveContainer`: el chart de recharts.
 */
export interface LienzoGraficoProps {
  titulo: string;
  subtitulo?: string;
  aclaracion?: ReactNode;
  acciones?: ReactNode;
  resumen?: ReactNode;
  altura?: number;
  children: ReactNode;
}

export function LienzoGrafico({
  titulo,
  subtitulo,
  aclaracion,
  acciones,
  resumen,
  altura = 280,
  children,
}: LienzoGraficoProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground-title">{titulo}</h3>
            {aclaracion && <InfoTooltip content={aclaracion} />}
          </div>
          {subtitulo && <p className="text-xs text-foreground-secondary">{subtitulo}</p>}
        </div>
        {acciones}
      </div>

      {resumen}

      <div style={{ height: altura }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/**
 * Grilla de fondo: una sola línea horizontal por marca, sin verticales y sin
 * guiones. El punteado agrega ruido y se lee como "proyección" o "umbral" cuando
 * es sólo una referencia.
 */
export function GrillaGrafico() {
  return <CartesianGrid horizontal vertical={false} stroke="var(--color-chart-grid)" />;
}

/**
 * Eje temporal **numérico**, no categórico.
 *
 * Con `dataKey` categórico recharts reparte los puntos con separación uniforme sin
 * importar cuánto tiempo pasó entre uno y otro: un sensor de 15 minutos y otro de 5
 * se dibujan igual, y una interrupción de dos horas ocupa lo mismo que un intervalo
 * normal. Fijando el dominio al rango pedido, el ancho del gráfico representa el
 * período completo y cada punto cae donde le corresponde.
 */
export function EjeTiempo({
  dominio,
  formatear,
}: {
  dominio: [number, number];
  formatear: (_ms: number) => string;
}) {
  return (
    <XAxis
      dataKey="timestamp"
      type="number"
      scale="time"
      domain={dominio}
      tickFormatter={formatear}
      tick={{ fontSize: 11, fill: "var(--color-foreground-secondary)" }}
      stroke="var(--color-chart-grid)"
      minTickGap={40}
    />
  );
}

/** Eje de valores. `dominio` se comparte entre paneles para que comparar sea válido. */
export function EjeValor({
  dominio,
  formatear,
  ancho = 52,
}: {
  dominio?: [number, number];
  formatear: (_valor: number) => string;
  ancho?: number;
}) {
  return (
    <YAxis
      domain={dominio ?? ["auto", "auto"]}
      tickFormatter={formatear}
      tick={{ fontSize: 11, fill: "var(--color-foreground-secondary)" }}
      stroke="var(--color-chart-grid)"
      width={ancho}
    />
  );
}
