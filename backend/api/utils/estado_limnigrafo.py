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
    - fuera_de_rango: tiempo sin conexión mayor a tiempo_peligro
    - peligro: última altura medida mayor o igual a altura_maxima_agua
    - advertencia: tiempo sin conexión mayor a tiempo_advertencia
    - normal: caso contrario
    """
    referencia = referencia or timezone.now()

    config = getattr(limnigrafo, "configuracion", None)
    altura_maxima_agua = config.altura_maxima_agua if config else None

    tiempo_fuera_de_rango_excedido = False
    tiempo_advertencia_excedido = False

    if limnigrafo.ultima_medicion:
        tiempo_transcurrido = referencia - limnigrafo.ultima_medicion.fecha_hora

        if tiempo_transcurrido < timedelta(0):
            tiempo_transcurrido = timedelta(0)

        advertencia_delta = _to_timedelta(config.tiempo_advertencia) if config else None
        peligro_delta = _to_timedelta(config.tiempo_peligro) if config else None

        if peligro_delta is not None and tiempo_transcurrido > peligro_delta:
            tiempo_fuera_de_rango_excedido = True
        elif advertencia_delta is not None and tiempo_transcurrido > advertencia_delta:
            tiempo_advertencia_excedido = True

    ultima_medicion = limnigrafo.ultima_medicion
    altura_en_peligro = (
        ultima_medicion is not None
        and isinstance(altura_maxima_agua, (int, float))
        and ultima_medicion.altura_agua >= altura_maxima_agua
    )

    if tiempo_fuera_de_rango_excedido:
        return "sin_conexion"
    if altura_en_peligro:
        return "peligro"
    if tiempo_advertencia_excedido:
        return "advertencia"
    return "normal"

def calcular_estado_medicion_limnigrafo(limnigrafo):
    """
    Determina si la última medición física está dentro o fuera de los rangos configurados.
    """
    medicion = limnigrafo.ultima_medicion
    if not medicion:
        return "normal"
    config = getattr(limnigrafo, "configuracion", None)
    if not config:
        return "normal"
        
    from api.utils.alertas import _campos_fuera_de_rango
    campos = _campos_fuera_de_rango(medicion, config)
    return "fuera_de_rango" if campos else "normal"
