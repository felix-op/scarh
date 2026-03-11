from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from typing import Any, Iterable

from django.db.models import Model

from ..models import Accion


def registrar_accion_auditoria(
    *,
    tipo_accion: str,
    entidad: str,
    descripcion: str,
    request: Any | None = None,
    usuario: Any | None = None,
    entidad_id: str | int | None = None,
    estado: str = "success",
    metadata: dict[str, Any] | None = None,
) -> Accion:
    actor = usuario

    if actor is None and request is not None:
        usuario_request = getattr(request, "user", None)
        if usuario_request is not None and getattr(usuario_request, "is_authenticated", False):
            actor = usuario_request

    return Accion.objects.create(
        tipo_accion=tipo_accion,
        entidad=entidad,
        entidad_id=str(entidad_id) if entidad_id is not None else "",
        descripcion=descripcion,
        estado=estado,
        metadata=metadata or {},
        usuario=actor,
    )


def normalizar_valor_auditoria(valor: Any) -> Any:
    if isinstance(valor, Model):
        if hasattr(valor, "codigo"):
            return getattr(valor, "codigo")
        if hasattr(valor, "username"):
            return getattr(valor, "username")
        return getattr(valor, "pk", str(valor))

    if isinstance(valor, (datetime, date, time)):
        return valor.isoformat()

    if isinstance(valor, Decimal):
        return float(valor)

    if isinstance(valor, list):
        return [normalizar_valor_auditoria(item) for item in valor]

    if isinstance(valor, tuple):
        return [normalizar_valor_auditoria(item) for item in valor]

    if isinstance(valor, dict):
        return {
            str(clave): normalizar_valor_auditoria(item)
            for clave, item in valor.items()
        }

    return valor


def construir_cambios_instancia(
    instancia: Any,
    nuevos_valores: dict[str, Any],
    *,
    campos_excluidos: Iterable[str] | None = None,
) -> list[dict[str, Any]]:
    excluidos = set(campos_excluidos or [])
    cambios: list[dict[str, Any]] = []

    for campo, nuevo_valor_raw in nuevos_valores.items():
        if campo in excluidos:
            continue

        viejo_valor_raw = getattr(instancia, campo, None)
        viejo_valor = normalizar_valor_auditoria(viejo_valor_raw)
        nuevo_valor = normalizar_valor_auditoria(nuevo_valor_raw)

        if viejo_valor == nuevo_valor:
            continue

        cambios.append(
            {
                "field": campo,
                "old": viejo_valor,
                "new": nuevo_valor,
            }
        )

    return cambios


def _texto_valor(valor: Any) -> str:
    if valor in (None, ""):
        return "-"

    return str(valor)


def construir_descripcion_modificacion(
    prefijo: str,
    cambios: list[dict[str, Any]],
) -> str:
    if not cambios:
        return f"{prefijo} Sin cambios detectados."

    detalles = []
    for cambio in cambios:
        detalles.append(
            f"{cambio['field']}: "
            f"old='{_texto_valor(cambio.get('old'))}' -> "
            f"new='{_texto_valor(cambio.get('new'))}'"
        )

    return f"{prefijo} {'; '.join(detalles)}."
