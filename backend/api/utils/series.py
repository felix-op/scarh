"""
Downsampling de series temporales de mediciones.

El navegador no puede dibujar 260.000 puntos, y tampoco los necesita: la pantalla
tiene unos 1.500 píxeles de ancho. Este módulo elige un tamaño de cubeta y agrupa
las mediciones en el servidor, de modo que el volumen de la respuesta dependa de
la resolución pedida y no del rango consultado.
"""

from datetime import timedelta

from django.db.models import DateTimeField, DurationField, Func
from django.utils import timezone

#: Tamaños de cubeta disponibles, de menor a mayor.
#:
#: Son todos divisores de un día, o múltiplos de un día: alineados a la medianoche
#: local, cada cubeta cae en un horario redondo ("14:00 a 15:00" y no "14:37 a
#: 15:37"), que es lo que hace legible el eje temporal.
ESCALERA_BUCKETS = [
    timedelta(minutes=1),
    timedelta(minutes=2),
    timedelta(minutes=5),
    timedelta(minutes=10),
    timedelta(minutes=15),
    timedelta(minutes=30),
    timedelta(hours=1),
    timedelta(hours=2),
    timedelta(hours=3),
    timedelta(hours=4),
    timedelta(hours=6),
    timedelta(hours=8),
    timedelta(hours=12),
    timedelta(days=1),
    timedelta(days=2),
    timedelta(days=7),
    timedelta(days=14),
    timedelta(days=30),
]

#: Valor por defecto de `max_puntos` si el cliente no lo manda.
MAX_PUNTOS_DEFECTO = 200

#: Límites aceptados para `max_puntos`.
MIN_PUNTOS_PERMITIDO = 10
MAX_PUNTOS_PERMITIDO = 1000


class DateBin(Func):
    """
    `date_bin(stride, source, origin)` de PostgreSQL 14+.

    Agrupa timestamps en cubetas de ancho fijo alineadas a un origen. El ORM no
    tiene equivalente: `Trunc*` sólo maneja unidades de calendario y no sirve para
    cubetas de 5 minutos o de 3 horas.
    """

    function = "date_bin"
    arity = 3
    output_field = DateTimeField()


def origen_de_cubetas(fecha_inicio):
    """
    Medianoche local del día en que arranca el rango.

    Se usa como origen de `date_bin` para que las cubetas queden alineadas al reloj
    local y no al instante arbitrario en que empieza la consulta.
    """
    inicio_local = timezone.localtime(fecha_inicio, timezone.get_current_timezone())
    return inicio_local.replace(hour=0, minute=0, second=0, microsecond=0)


def elegir_bucket(fecha_inicio, fecha_fin, max_puntos, mediciones_por_dispositivo):
    """
    Elige el tamaño de cubeta más chico que no genere más puntos de los pedidos.

    El tope no es sólo `max_puntos`: la cubeta tampoco puede ser más angosta que la
    cadencia real de los datos. Si un sensor reporta cada 5 minutos y se pidieran
    200 puntos sobre 6 horas, las cubetas serían de 1,8 minutos y dos de cada tres
    quedarían vacías: la serie se vería cortada en pedazos por huecos que no
    existen. Acotando por la cantidad de mediciones, la resolución máxima es la
    densidad real de los datos.

    :param mediciones_por_dispositivo: cantidad del dispositivo más denso del
        conjunto; es el que determina cuánto se puede afinar sin fabricar huecos.
    :return: `timedelta` de la escalera.
    """
    duracion = fecha_fin - fecha_inicio
    if duracion <= timedelta(0):
        return ESCALERA_BUCKETS[0]

    objetivo = min(max_puntos, max(mediciones_por_dispositivo, 1))
    ideal = duracion / objetivo

    for bucket in ESCALERA_BUCKETS:
        if bucket >= ideal:
            return bucket

    return ESCALERA_BUCKETS[-1]


def generar_grilla(fecha_inicio, fecha_fin, bucket, origen):
    """
    Enumera el comienzo de cada cubeta que toca el rango pedido.

    Se emiten **todas**, incluidas las que no tienen mediciones: una cubeta vacía es
    un tramo sin datos, y el gráfico necesita saberlo para cortar la línea en lugar
    de trazar una recta a través de un intervalo en el que nadie midió.

    :return: lista de `datetime` aware, en orden.
    """
    grilla = []
    cursor = origen

    # El origen es la medianoche del día de inicio, así que puede quedar antes del
    # rango: se saltean las cubetas que terminan antes de que el rango empiece.
    while cursor < fecha_fin:
        if cursor + bucket > fecha_inicio:
            grilla.append(cursor)
            if len(grilla) > MAX_PUNTOS_PERMITIDO:
                break
        cursor += bucket

    return grilla
