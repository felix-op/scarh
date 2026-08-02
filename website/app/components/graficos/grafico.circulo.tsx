"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

/**
 * Un segmento de la dona.
 *
 * @property {string} clave Identificador estable del segmento.
 * @property {string} etiqueta Nombre visible.
 * @property {number} valor Cantidad.
 * @property {string} color Token CSS del color (`var(--chart-n)`).
 */
export interface SegmentoCirculo {
  clave: string;
  etiqueta: string;
  valor: number;
  color: string;
}

/**
 * Dona de reparto, con leyenda de nombre y cantidad al costado.
 *
 * Es válida acá porque es una lectura de parte-sobre-el-todo de un vistazo y son
 * pocos segmentos. La leyenda **no es opcional**: nombra cada segmento con su
 * cantidad y su porcentaje, de modo que la identidad nunca depende sólo del color
 * y los valores parecidos, que en una dona son difíciles de comparar por ángulo,
 * se leen como números.
 *
 * Tamaño fijo y sin `ResponsiveContainer` a propósito: así no necesita medir el
 * contenedor y puede renderizarse en el servidor como cualquier otro componente.
 *
 * @property {SegmentoCirculo[]} segmentos Partes del total, en orden de presentación.
 * @property {string} [etiquetaCentro] Rótulo bajo el total, en el centro.
 * @property {number} [tamanio] Lado del gráfico en píxeles.
 */
export interface GraficoCirculoProps {
  segmentos: SegmentoCirculo[];
  etiquetaCentro?: string;
  tamanio?: number;
}

export function GraficoCirculo({ segmentos, etiquetaCentro, tamanio = 148 }: GraficoCirculoProps) {
  const total = segmentos.reduce((suma, segmento) => suma + segmento.valor, 0);

  if (total === 0) {
    return <p className="text-sm text-foreground-disabled">Todavía no hay mediciones cargadas.</p>;
  }

  const conDatos = segmentos.filter((segmento) => segmento.valor > 0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <PieChart width={tamanio} height={tamanio}>
        <Pie
          data={conDatos}
          dataKey="valor"
          nameKey="etiqueta"
          innerRadius={tamanio * 0.3}
          outerRadius={tamanio * 0.46}
          // Un hueco del color de la superficie entre porciones, en vez de un borde
          // dibujado alrededor de cada una.
          paddingAngle={2}
          stroke="var(--color-card)"
          strokeWidth={2}
          isAnimationActive={false}
        >
          {conDatos.map((segmento) => (
            <Cell key={segmento.clave} fill={segmento.color} />
          ))}

          <Label
            position="center"
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox)) return null;
              return (
                <>
                  <text
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) - (etiquetaCentro ? 6 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground-title text-lg font-semibold"
                  >
                    {total.toLocaleString("es-AR")}
                  </text>
                  {etiquetaCentro && (
                    <text
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground-secondary text-[11px]"
                    >
                      {etiquetaCentro}
                    </text>
                  )}
                </>
              );
            }}
          />
        </Pie>
      </PieChart>

      <dl className="flex min-w-40 flex-1 flex-col gap-1.5">
        {segmentos.map((segmento) => (
          <div key={segmento.clave} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-shape-full"
              style={{ backgroundColor: segmento.color }}
            />
            <dt className="flex-1 text-foreground-secondary">{segmento.etiqueta}</dt>
            <dd className="tabular-nums text-foreground">
              {segmento.valor.toLocaleString("es-AR")}
              <span className="ml-1 text-xs text-foreground-disabled">
                {Math.round((segmento.valor / total) * 100)} %
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
