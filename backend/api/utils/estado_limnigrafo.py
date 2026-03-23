from datetime import timedelta

from django.utils import timezone


def _to_timedelta(value):
    """Convierte umbrales a timedelta.

    Soporta:
    - segundos (int/float)
    - objetos time (legacy con hour/minute/second)
    - strings HH:MM:SS
    """
    if value is None:
        return None

    if isinstance(value, timedelta):
        return max(value, timedelta(0))

    if isinstance(value, (int, float)):
        return timedelta(seconds=max(float(value), 0))

    # Compatibilidad con TimeField legacy.
    if hasattr(value, "hour") and hasattr(value, "minute") and hasattr(value, "second"):
        return timedelta(
            hours=value.hour or 0,
            minutes=value.minute or 0,
            seconds=value.second or 0,
        )

    if isinstance(value, str):
        parts = value.strip().split(":")
        if len(parts) == 3:
            try:
                hours = int(parts[0])
                minutes = int(parts[1])
                seconds = int(parts[2])
            except ValueError:
                return None
            total_seconds = max((hours * 3600) + (minutes * 60) + seconds, 0)
            return timedelta(seconds=total_seconds)

    return None


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

    bateria_actual = limnigrafo.bateria_actual
    bateria_max = limnigrafo.bateria_max
    bateria_min = limnigrafo.bateria_min

    if (
        bateria_actual is not None
        and isinstance(bateria_max, (int, float))
        and isinstance(bateria_min, (int, float))
        and bateria_max > 0
    ):
        porcentaje_bateria = (bateria_actual / bateria_max) * 100
        porcentaje_min = (bateria_min / bateria_max) * 100

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

        advertencia_delta = _to_timedelta(limnigrafo.tiempo_advertencia)
        peligro_delta = _to_timedelta(limnigrafo.tiempo_peligro)
        fuera_servicio_delta = peligro_delta * 3 if peligro_delta is not None else None

        if fuera_servicio_delta is not None and tiempo_transcurrido > fuera_servicio_delta:
            tiempo_fuera_servicio_excedido = True
        elif peligro_delta is not None and tiempo_transcurrido > peligro_delta:
            tiempo_peligro_excedido = True
        elif advertencia_delta is not None and tiempo_transcurrido > advertencia_delta:
            tiempo_advertencia_excedido = True

    if tiempo_fuera_servicio_excedido:
        return "fuera_de_servicio"
    if bateria_critica or tiempo_peligro_excedido:
        return "peligro"
    if bateria_baja or tiempo_advertencia_excedido:
        return "advertencia"
    return "normal"
