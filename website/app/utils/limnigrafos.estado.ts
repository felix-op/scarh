import { tieneCoberturaAlertas } from "./constantes-limnigrafos";

/**
 * Situación de un limnígrafo, resuelta por precedencia.
 *
 * @property {string} etiqueta Texto para mostrar.
 * @property {"success" | "warn" | "error" | "neutral"} variante Color del estado.
 * @property {number} criticidad Cuanto más bajo, más urgente. Define el orden.
 * @property {boolean} requiereAtencion Si alguien tiene que hacer algo al respecto.
 */
export interface EstadoLimnigrafoEvaluado {
  etiqueta: string;
  variante: "success" | "warn" | "error" | "neutral";
  criticidad: number;
  requiereAtencion: boolean;
}

/** Datos mínimos para evaluar el estado. */
export interface EntradaEstadoLimnigrafo {
  estadoConexion: string;
  estadoMedicion: string;
  tipoComunicacion: string[];
}

/**
 * Evalúa el estado de un limnígrafo.
 *
 * Es la **única** fuente de verdad de esta lógica: la usan tanto el chip como el
 * ordenamiento y el contador de "requieren atención". Si el chip decidiera por su
 * cuenta y el orden por la suya, un dispositivo podría aparecer en rojo pero
 * ordenado entre los sanos.
 *
 * Precedencia, de más a menos urgente:
 * 1. **Sin conexión** con enlace remoto: debería estar reportando y no lo hace.
 * 2. **Demorado**: reporta, pero tarde.
 * 3. **Fuera de rango**: la última medición excede los umbrales configurados.
 * 4. Todo en orden.
 *
 * Los equipos **sin enlace remoto** no tienen estado de conexión: uno que sólo se
 * descarga por USB está permanentemente "sin conexión", y contarlo como falla sería
 * un falso positivo constante. Para esos sólo importa si el último valor está fuera
 * de rango, cosa que puede pasar igual con datos cargados a mano.
 */
export function evaluarEstadoLimnigrafo({
  estadoConexion,
  estadoMedicion,
  tipoComunicacion,
}: EntradaEstadoLimnigrafo): EstadoLimnigrafoEvaluado {
  const fueraDeRango = estadoMedicion === "fuera_de_rango";

  if (!tieneCoberturaAlertas(tipoComunicacion)) {
    return fueraDeRango
      ? { etiqueta: "Fuera de rango", variante: "warn", criticidad: 2, requiereAtencion: true }
      : {
          etiqueta: "Sin envío de datos",
          variante: "neutral",
          criticidad: 9,
          requiereAtencion: false,
        };
  }

  if (estadoConexion === "sin_conexion") {
    return { etiqueta: "Sin conexión", variante: "error", criticidad: 0, requiereAtencion: true };
  }
  if (estadoConexion === "demorado") {
    return { etiqueta: "Demorado", variante: "warn", criticidad: 1, requiereAtencion: true };
  }
  if (fueraDeRango) {
    return { etiqueta: "Fuera de rango", variante: "warn", criticidad: 2, requiereAtencion: true };
  }

  return { etiqueta: "En línea", variante: "success", criticidad: 9, requiereAtencion: false };
}

/**
 * Ordena los limnígrafos poniendo primero lo que necesita atención.
 *
 * A igual criticidad respeta el orden alfabético del código, y eso importa más de lo
 * que parece: el tablero se refresca solo, y si el desempate fuera arbitrario las
 * tarjetas se reacomodarían en cada ciclo. Así sólo se mueven cuando el estado de un
 * dispositivo cambió de verdad, que es cuando el movimiento significa algo.
 *
 * No muta el arreglo recibido.
 */
export function ordenarPorCriticidad<T>(
  limnigrafos: T[],
  extraer: (_limnigrafo: T) => EntradaEstadoLimnigrafo & { codigo: string }
): T[] {
  return [...limnigrafos].sort((a, b) => {
    const datosA = extraer(a);
    const datosB = extraer(b);
    const diferencia =
      evaluarEstadoLimnigrafo(datosA).criticidad - evaluarEstadoLimnigrafo(datosB).criticidad;

    return diferencia !== 0 ? diferencia : datosA.codigo.localeCompare(datosB.codigo, "es");
  });
}
