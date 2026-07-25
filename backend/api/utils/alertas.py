from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from ..models import Alerta, UsuarioNotificacion
from .estado_limnigrafo import _to_timedelta


def _asignar_alerta_a_usuarios(alerta):
    usuarios = list(get_user_model().objects.filter(is_active=True))
    if not usuarios:
        return

    alerta.usuarios.set(usuarios)
    UsuarioNotificacion.objects.bulk_create(
        [
            UsuarioNotificacion(usuario=usuario, alerta=alerta)
            for usuario in usuarios
        ],
        ignore_conflicts=True,
    )


def _crear_alerta_para_usuarios(*, tipo, descripcion, limnigrafo, medicion=None, condicion=None, persistente=False):
    defaults = {
        "descripcion": descripcion,
        "medicion": medicion,
    }
    if not persistente:
        alerta = Alerta.objects.create(
            tipo=tipo,
            descripcion=descripcion,
            limnigrafo=limnigrafo,
            medicion=medicion,
        )
        _asignar_alerta_a_usuarios(alerta)
        return alerta

    try:
        with transaction.atomic():
            alerta, creada = Alerta.objects.get_or_create(
                tipo=tipo,
                limnigrafo=limnigrafo,
                condicion=condicion,
                condicion_activa=True,
                defaults=defaults,
            )
    except IntegrityError:
        alerta = Alerta.objects.get(
            tipo=tipo,
            limnigrafo=limnigrafo,
            condicion=condicion,
            condicion_activa=True,
        )
        creada = False

    if not creada:
        return alerta

    _asignar_alerta_a_usuarios(alerta)
    return alerta


def _cerrar_condiciones_resueltas(*, limnigrafo, tipo, condiciones_activas, condiciones_a_revisar=None):
    ahora = timezone.now()
    queryset = Alerta.objects.filter(
        tipo=tipo,
        limnigrafo=limnigrafo,
        condicion_activa=True,
    )
    if condiciones_a_revisar is not None:
        queryset = queryset.filter(condicion__in=condiciones_a_revisar)

    return queryset.exclude(condicion__in=condiciones_activas).update(
        condicion_activa=False,
        estado="solucionado",
        fecha_cierre=ahora,
    )


def _condiciones_fuera_de_rango(medicion, config):
    condiciones = []

    if config.altura_minima_agua is not None and medicion.altura_agua < config.altura_minima_agua:
        condiciones.append(("altura_agua.min", "altura_agua"))
    elif config.altura_maxima_agua is not None and medicion.altura_agua > config.altura_maxima_agua:
        condiciones.append(("altura_agua.max", "altura_agua"))

    if medicion.temperatura is not None:
        if medicion.temperatura < config.temperatura_minima:
            condiciones.append(("temperatura.min", "temperatura"))
        elif medicion.temperatura > config.temperatura_maxima:
            condiciones.append(("temperatura.max", "temperatura"))

    if medicion.presion is not None:
        if config.presion_minima is not None and medicion.presion < config.presion_minima:
            condiciones.append(("presion.min", "presion"))
        elif config.presion_maxima is not None and medicion.presion > config.presion_maxima:
            condiciones.append(("presion.max", "presion"))

    if medicion.nivel_de_bateria is not None:
        if config.bateria_min is not None and medicion.nivel_de_bateria < config.bateria_min:
            condiciones.append(("nivel_de_bateria.min", "nivel_de_bateria"))

    return condiciones


def _condiciones_observadas_fuera_de_rango(medicion, config):
    condiciones = set()

    if config.altura_minima_agua is not None:
        condiciones.add("altura_agua.min")
    if config.altura_maxima_agua is not None:
        condiciones.add("altura_agua.max")

    if medicion.temperatura is not None:
        condiciones.update({"temperatura.min", "temperatura.max"})

    if medicion.presion is not None:
        if config.presion_minima is not None:
            condiciones.add("presion.min")
        if config.presion_maxima is not None:
            condiciones.add("presion.max")

    if medicion.nivel_de_bateria is not None and config.bateria_min is not None:
        condiciones.add("nivel_de_bateria.min")

    return condiciones


def generar_alerta_medicion_fuera_de_rango(medicion):
    limnigrafo = medicion.limnigrafo
    config = getattr(limnigrafo, "configuracion", None)
    if not config:
        return

    condiciones_fuera_de_rango = _condiciones_fuera_de_rango(medicion, config)
    condiciones_activas = {condicion for condicion, _ in condiciones_fuera_de_rango}
    _cerrar_condiciones_resueltas(
        limnigrafo=limnigrafo,
        tipo="fuera_rango_medicion",
        condiciones_activas=condiciones_activas,
        condiciones_a_revisar=_condiciones_observadas_fuera_de_rango(medicion, config),
    )
    if not condiciones_fuera_de_rango:
        return

    for condicion, campo in condiciones_fuera_de_rango:
        descripcion = (
            f"Medición fuera de rango en {campo} "
            f"para el limnígrafo '{limnigrafo.codigo}'."
        )
        _crear_alerta_para_usuarios(
            tipo="fuera_rango_medicion",
            descripcion=descripcion,
            limnigrafo=limnigrafo,
            medicion=medicion,
            condicion=condicion,
            persistente=True,
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
    condiciones_por_tipo = _condiciones_estado_limnigrafo(limnigrafo, nuevo_estado)
    for tipo in ["advertencia_limnigrafo", "fuera_de_rango_limnigrafo", "peligro_limnigrafo"]:
        condiciones = condiciones_por_tipo.get(tipo, {})
        _cerrar_condiciones_resueltas(
            limnigrafo=limnigrafo,
            tipo=tipo,
            condiciones_activas=set(condiciones),
        )
        for condicion, descripcion in condiciones.items():
            _crear_alerta_para_usuarios(
                tipo=tipo,
                descripcion=descripcion,
                limnigrafo=limnigrafo,
                medicion=medicion,
                condicion=condicion,
                persistente=True,
            )


def _condiciones_estado_limnigrafo(limnigrafo, nuevo_estado):
    config = getattr(limnigrafo, "configuracion", None)
    condiciones = {
        "advertencia_limnigrafo": {},
        "fuera_de_rango_limnigrafo": {},
        "peligro_limnigrafo": {},
    }

    if not config:
        return condiciones

    if nuevo_estado == "fuera_de_rango":
        condiciones["fuera_de_rango_limnigrafo"]["tiempo_peligro"] = (
            f"Limnígrafo {limnigrafo.codigo} - Fuera de rango por falta de envío de datos."
        )
        return condiciones

    if nuevo_estado == "peligro":
        condiciones["peligro_limnigrafo"]["altura_maxima_agua"] = (
            f"Limnígrafo {limnigrafo.codigo} en peligro: la altura del nivel del agua "
            f"alcanzó o superó el máximo configurado."
        )
        return condiciones

    if nuevo_estado != "advertencia":
        return condiciones

    if (
        limnigrafo.bateria_actual is not None
        and config.bateria_min is not None
        and limnigrafo.bateria_actual <= config.bateria_min
    ):
        condiciones["advertencia_limnigrafo"]["bateria_minima"] = (
            f"Advertencia al limnígrafo {limnigrafo.codigo}: alcanzó la batería mínima."
        )

    if limnigrafo.ultima_conexion:
        tiempo_transcurrido = timezone.now() - limnigrafo.ultima_conexion
        advertencia_delta = _to_timedelta(config.tiempo_advertencia)
        peligro_delta = _to_timedelta(config.tiempo_peligro)
        if (
            advertencia_delta is not None
            and tiempo_transcurrido > advertencia_delta
            and (peligro_delta is None or tiempo_transcurrido <= peligro_delta)
        ):
            condiciones["advertencia_limnigrafo"]["tiempo_advertencia"] = (
                f"Advertencia al limnígrafo {limnigrafo.codigo}: no está enviando datos "
                f"dentro del tiempo esperado."
            )

    return condiciones
