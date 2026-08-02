"""
Cálculo de estadísticas descriptivas sobre series de mediciones y utilidades de
agrupación temporal.

Este módulo es la única implementación de las fórmulas: tanto el endpoint legacy
(`/estadistica/`) como el nuevo (`/estadisticas/tabla/`) lo consumen, para que no
puedan volver a divergir dos definiciones de la misma métrica.

Convención de "sin datos": todas las métricas devuelven `None` cuando la serie
está vacía. `0.0` es un valor válido de altura de agua o de temperatura, así que
usarlo como sentinela hace indistinguible "no hubo mediciones" de "el valor fue
cero". El endpoint legacy convierte estos `None` a `0.0` para no romper a los
clientes que ya dependen de ese comportamiento.
"""

from collections import Counter
from datetime import datetime, timedelta
import math
import statistics

from django.utils import timezone

#: Atributos numéricos de `Medicion` sobre los que se pueden calcular estadísticas.
ATRIBUTOS_DISPONIBLES = ["altura_agua", "presion", "temperatura", "nivel_de_bateria"]

#: Agrupaciones que producen una fila por período de tiempo.
AGRUPACIONES_PERIODO = ["dia", "semana", "mes", "anio"]

#: Agrupación que produce una fila por limnígrafo.
AGRUPACION_DISPOSITIVO = "dispositivo"

#: Todas las agrupaciones aceptadas por el endpoint de tabla.
AGRUPACIONES = [AGRUPACION_DISPOSITIVO, *AGRUPACIONES_PERIODO]

#: Claves de métricas que devuelve `calcular_estadisticas`, sin contar `total_registros`.
CLAVES_ESTADISTICAS = (
    "minimo",
    "maximo",
    "promedio",
    "mediana",
    "moda",
    "desvio_estandar",
    "percentil_90",
)

#: Tope de filas que puede generar una agrupación por período. Evita que un rango
#: de años agrupado por día devuelva miles de filas que ninguna tabla puede mostrar.
MAX_PERIODOS = 500


def calcular_estadisticas(valores):
    """
    Calcula las estadísticas descriptivas de una lista de valores numéricos.

    Los `None` se descartan antes de calcular. El desvío estándar es **muestral**
    (divide por n-1) y por eso es `None` cuando hay una sola medición: con n=1 la
    dispersión no está definida, y devolver `0.0` afirmaría que no hubo variación.

    :param valores: iterable de números, posiblemente con `None`.
    :return: dict con las claves de `CLAVES_ESTADISTICAS` más `total_registros`.
    """
    limpios = sorted(valor for valor in valores if valor is not None)

    if not limpios:
        vacio = {clave: None for clave in CLAVES_ESTADISTICAS}
        vacio["total_registros"] = 0
        return vacio

    return {
        "minimo": limpios[0],
        "maximo": limpios[-1],
        "promedio": statistics.fmean(limpios),
        "mediana": statistics.median(limpios),
        "moda": _calcular_moda(limpios),
        "desvio_estandar": statistics.stdev(limpios) if len(limpios) > 1 else None,
        "percentil_90": calcular_percentil(limpios, 0.9),
        "total_registros": len(limpios),
    }


def calcular_percentil(ordenados, fraccion):
    """
    Percentil por interpolación lineal entre los dos valores más cercanos.

    :param ordenados: lista de números **ya ordenada** de menor a mayor.
    :param fraccion: posición del percentil entre 0 y 1 (0.9 = percentil 90).
    :return: el valor del percentil, o `None` si la lista está vacía.
    """
    if not ordenados:
        return None
    if len(ordenados) == 1:
        return ordenados[0]

    posicion = (len(ordenados) - 1) * fraccion
    inferior = math.floor(posicion)
    superior = math.ceil(posicion)

    if inferior == superior:
        return ordenados[int(posicion)]

    return ordenados[inferior] * (superior - posicion) + ordenados[superior] * (posicion - inferior)


def _calcular_moda(valores, decimales=2):
    """
    Moda agrupada: redondea antes de contar frecuencias.

    Sin el redondeo, las variaciones decimales mínimas de un sensor hacen que
    prácticamente ningún valor se repita y la moda pierde sentido. Ante empate se
    devuelve el menor de los valores más frecuentes, para que el resultado sea
    determinista.
    """
    if not valores:
        return None

    frecuencias = Counter(round(valor, decimales) for valor in valores)
    max_frecuencia = max(frecuencias.values())
    modas = [valor for valor, frecuencia in frecuencias.items() if frecuencia == max_frecuencia]
    return min(modas)


# --------------------------------------------------------------------------- #
# Agrupación temporal
# --------------------------------------------------------------------------- #


def inicio_de_periodo(fecha_local, agrupacion):
    """
    Trunca una fecha local al comienzo de su período.

    :param fecha_local: `datetime` naive en hora local.
    :param agrupacion: uno de `AGRUPACIONES_PERIODO`.
    :return: `datetime` naive en hora local, al inicio del período.
    """
    if agrupacion == "dia":
        return fecha_local.replace(hour=0, minute=0, second=0, microsecond=0)
    if agrupacion == "semana":
        lunes = fecha_local - timedelta(days=fecha_local.weekday())
        return lunes.replace(hour=0, minute=0, second=0, microsecond=0)
    if agrupacion == "mes":
        return fecha_local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if agrupacion == "anio":
        return fecha_local.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Agrupación temporal desconocida: {agrupacion}")


def siguiente_periodo(inicio_local, agrupacion):
    """
    Devuelve el inicio del período siguiente a `inicio_local`.

    :param inicio_local: `datetime` naive en hora local, ya truncado al período.
    :param agrupacion: uno de `AGRUPACIONES_PERIODO`.
    :return: `datetime` naive en hora local.
    """
    if agrupacion == "dia":
        return inicio_local + timedelta(days=1)
    if agrupacion == "semana":
        return inicio_local + timedelta(days=7)
    if agrupacion == "mes":
        if inicio_local.month == 12:
            return inicio_local.replace(year=inicio_local.year + 1, month=1)
        return inicio_local.replace(month=inicio_local.month + 1)
    if agrupacion == "anio":
        return inicio_local.replace(year=inicio_local.year + 1)
    raise ValueError(f"Agrupación temporal desconocida: {agrupacion}")


def clave_de_periodo(inicio_local, agrupacion):
    """
    Identificador estable y ordenable del período, pensado para usarse como clave
    de fila en el frontend.

    Formatos: `2026-01-15` (día), `2026-W03` (semana ISO), `2026-01` (mes),
    `2026` (año).
    """
    if agrupacion == "dia":
        return inicio_local.strftime("%Y-%m-%d")
    if agrupacion == "semana":
        anio_iso, semana_iso, _ = inicio_local.isocalendar()
        return f"{anio_iso}-W{semana_iso:02d}"
    if agrupacion == "mes":
        return inicio_local.strftime("%Y-%m")
    if agrupacion == "anio":
        return inicio_local.strftime("%Y")
    raise ValueError(f"Agrupación temporal desconocida: {agrupacion}")


def generar_periodos(fecha_inicio, fecha_fin, agrupacion):
    """
    Enumera todos los períodos que cubren el rango pedido, en hora local.

    Se enumeran **todos**, incluidos los que no tienen mediciones: un mes sin
    datos es información y tiene que aparecer como fila vacía, no desaparecer de
    la tabla.

    :param fecha_inicio: `datetime` aware, inicio del rango.
    :param fecha_fin: `datetime` aware, fin del rango.
    :param agrupacion: uno de `AGRUPACIONES_PERIODO`.
    :return: lista de tuplas `(clave, inicio_aware, fin_aware)`; `fin_aware` es el
        comienzo del período siguiente (intervalo semiabierto).
    :raises ValueError: si el rango genera más de `MAX_PERIODOS` filas.
    """
    zona = timezone.get_current_timezone()
    inicio_local = _a_local_naive(fecha_inicio)
    fin_local = _a_local_naive(fecha_fin)

    periodos = []
    cursor = inicio_de_periodo(inicio_local, agrupacion)

    while cursor <= fin_local:
        siguiente = siguiente_periodo(cursor, agrupacion)
        periodos.append(
            (
                clave_de_periodo(cursor, agrupacion),
                timezone.make_aware(cursor, zona),
                timezone.make_aware(siguiente, zona),
            )
        )
        if len(periodos) > MAX_PERIODOS:
            raise ValueError(
                f"El rango pedido genera más de {MAX_PERIODOS} períodos con la agrupación "
                f"'{agrupacion}'. Elegí una agrupación más gruesa o un rango más corto."
            )
        cursor = siguiente

    return periodos


def clave_de_medicion(fecha_hora, agrupacion):
    """
    Clave de período a la que pertenece una medición, en hora local.

    :param fecha_hora: `datetime` aware de la medición.
    :param agrupacion: uno de `AGRUPACIONES_PERIODO`.
    """
    return clave_de_periodo(inicio_de_periodo(_a_local_naive(fecha_hora), agrupacion), agrupacion)


def _a_local_naive(fecha):
    """
    Convierte un `datetime` a hora local y le saca la zona horaria.

    La aritmética de períodos se hace sobre naive local a propósito: sumar
    `timedelta(days=1)` a un datetime aware avanza 24 horas absolutas, que no
    siempre es "el mismo horario del día siguiente". Truncar y avanzar sobre los
    componentes locales y recién después volver a localizar da el resultado que
    espera el usuario.
    """
    if timezone.is_aware(fecha):
        return timezone.localtime(fecha).replace(tzinfo=None)
    return fecha


def rango_aware(fecha):
    """Normaliza a `datetime` aware, asumiendo hora local si viene naive."""
    if isinstance(fecha, datetime) and timezone.is_naive(fecha):
        return timezone.make_aware(fecha, timezone.get_current_timezone())
    return fecha
