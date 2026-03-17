from datetime import timedelta

from django.utils import timezone


def calcular_estado_limnigrafo(limnigrafo, referencia=None):
    """
    Determina el estado operativo del limnígrafo.

    Reglas:
    - fuera_de_servicio: tiempo sin conexión mayor a (tiempo_peligro * 3)
    - peligro: batería crítica o tiempo sin conexión mayor a tiempo_peligro
    - advertencia: batería baja o tiempo sin conexión mayor a tiempo_advertencia
    - normal: caso contrario
    """
    referencia = referencia or timezone.now()

    bateria_critica = False
    bateria_baja = False

    if limnigrafo.bateria_actual is not None and limnigrafo.bateria_max > 0:
        porcentaje_bateria = (limnigrafo.bateria_actual / limnigrafo.bateria_max) * 100
        porcentaje_min = (limnigrafo.bateria_min / limnigrafo.bateria_max) * 100

        if porcentaje_bateria <= porcentaje_min:
            bateria_critica = True
        elif porcentaje_bateria <= porcentaje_min + 10:
            bateria_baja = True

    tiempo_fuera_servicio_excedido = False
    tiempo_peligro_excedido = False
    tiempo_advertencia_excedido = False

    if limnigrafo.ultima_conexion:
        tiempo_transcurrido = referencia - limnigrafo.ultima_conexion

        if tiempo_transcurrido < timedelta(0):
            tiempo_transcurrido = timedelta(0)

        advertencia_delta = timedelta(
            hours=limnigrafo.tiempo_advertencia.hour,
            minutes=limnigrafo.tiempo_advertencia.minute,
            seconds=limnigrafo.tiempo_advertencia.second,
        )
        peligro_delta = timedelta(
            hours=limnigrafo.tiempo_peligro.hour,
            minutes=limnigrafo.tiempo_peligro.minute,
            seconds=limnigrafo.tiempo_peligro.second,
        )
        fuera_servicio_delta = peligro_delta * 3

        if tiempo_transcurrido > fuera_servicio_delta:
            tiempo_fuera_servicio_excedido = True
        elif tiempo_transcurrido > peligro_delta:
            tiempo_peligro_excedido = True
        elif tiempo_transcurrido > advertencia_delta:
            tiempo_advertencia_excedido = True

    if tiempo_fuera_servicio_excedido:
        return "fuera_de_servicio"
    if bateria_critica or tiempo_peligro_excedido:
        return "peligro"
    if bateria_baja or tiempo_advertencia_excedido:
        return "advertencia"
    return "normal"
