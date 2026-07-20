from django.contrib.auth import get_user_model

from ..models import Alerta, UsuarioNotificacion


def _crear_alerta_para_usuarios(*, tipo, descripcion, limnigrafo, medicion=None):
    alerta = Alerta.objects.create(
        tipo=tipo,
        descripcion=descripcion,
        limnigrafo=limnigrafo,
        medicion=medicion,
    )

    usuarios = list(get_user_model().objects.filter(is_active=True))
    if not usuarios:
        return alerta

    alerta.usuarios.set(usuarios)
    UsuarioNotificacion.objects.bulk_create(
        [
            UsuarioNotificacion(usuario=usuario, alerta=alerta)
            for usuario in usuarios
        ],
        ignore_conflicts=True,
    )
    return alerta


def _campos_fuera_de_rango(medicion, config):
    campos = []

    if config.altura_minima_agua is not None and medicion.altura_agua < config.altura_minima_agua:
        campos.append("altura_agua")
    elif config.altura_maxima_agua is not None and medicion.altura_agua > config.altura_maxima_agua:
        campos.append("altura_agua")

    if medicion.temperatura is not None:
        if medicion.temperatura < config.temperatura_minima or medicion.temperatura > config.temperatura_maxima:
            campos.append("temperatura")

    if medicion.presion is not None:
        if config.presion_minima is not None and medicion.presion < config.presion_minima:
            campos.append("presion")
        elif config.presion_maxima is not None and medicion.presion > config.presion_maxima:
            campos.append("presion")

    if medicion.nivel_de_bateria is not None:
        if config.bateria_min is not None and medicion.nivel_de_bateria < config.bateria_min:
            campos.append("nivel_de_bateria")

    return campos


def generar_alerta_medicion_fuera_de_rango(medicion):
    limnigrafo = medicion.limnigrafo
    config = getattr(limnigrafo, "configuracion", None)
    if not config:
        return

    campos_fuera_de_rango = _campos_fuera_de_rango(medicion, config)
    if not campos_fuera_de_rango:
        return

    descripcion = (
        f"Medición fuera de rango en {', '.join(campos_fuera_de_rango)} "
        f"para el limnígrafo '{limnigrafo.codigo}'."
    )
    _crear_alerta_para_usuarios(
        tipo="fuera_rango_medicion",
        descripcion=descripcion,
        limnigrafo=limnigrafo,
        medicion=medicion,
    )


def generar_alertas_medicion(medicion, estado_anterior, nuevo_estado):
    limnigrafo = medicion.limnigrafo
    generar_alerta_medicion_fuera_de_rango(medicion)

    generar_alerta_cambio_estado(
        limnigrafo=limnigrafo,
        estado_anterior=estado_anterior,
        nuevo_estado=nuevo_estado,
        medicion=medicion,
    )


def generar_alerta_cambio_estado(*, limnigrafo, estado_anterior, nuevo_estado, medicion=None):
    if nuevo_estado == estado_anterior:
        return

    if nuevo_estado == "advertencia":
        descripcion = (
            f"Advertencia al limnígrafo {limnigrafo.codigo}: no está enviando datos "
            f"dentro del tiempo esperado o alcanzó la batería mínima."
        )
        tipo = "advertencia_limnigrafo"
    elif nuevo_estado == "fuera_de_rango":
        descripcion = f"Limnígrafo {limnigrafo.codigo} - Fuera de rango por falta de envío de datos."
        tipo = "fuera_de_rango_limnigrafo"
    elif nuevo_estado == "peligro":
        descripcion = (
            f"Limnígrafo {limnigrafo.codigo} en peligro: la altura del nivel del agua "
            f"alcanzó o superó el máximo configurado."
        )
        tipo = "peligro_limnigrafo"
    else:
        return

    _crear_alerta_para_usuarios(
        tipo=tipo,
        descripcion=descripcion,
        limnigrafo=limnigrafo,
        medicion=medicion,
    )
