from rest_framework import serializers
from django.utils import timezone

from ..models import UsuarioNotificacion


class AlertaSerializer(serializers.ModelSerializer):
    alerta_id = serializers.IntegerField(source="alerta.id", read_only=True)
    tipo = serializers.CharField(source="alerta.tipo", read_only=True)
    fecha_hora = serializers.DateTimeField(source="alerta.fecha_hora", read_only=True)
    descripcion = serializers.CharField(source="alerta.descripcion", read_only=True)
    limnigrafo = serializers.IntegerField(source="alerta.limnigrafo.id", read_only=True, allow_null=True)
    # `Alerta.limnigrafo` es SET_NULL: sin `allow_null` el getattr sobre None revienta
    # y el listado entero devuelve 500 en cuanto se borra un limnígrafo.
    limnigrafo_codigo = serializers.CharField(
        source="alerta.limnigrafo.codigo", read_only=True, allow_null=True, default=None
    )
    medicion_id = serializers.IntegerField(source="alerta.medicion.id", read_only=True, allow_null=True)
    condicion = serializers.CharField(source="alerta.condicion", read_only=True, allow_null=True)
    condicion_activa = serializers.BooleanField(source="alerta.condicion_activa", read_only=True)
    fecha_cierre = serializers.DateTimeField(source="alerta.fecha_cierre", read_only=True, allow_null=True)

    class Meta:
        model = UsuarioNotificacion
        fields = [
            "id",
            "alerta_id",
            "estado",
            "tipo",
            "fecha_hora",
            "descripcion",
            "limnigrafo",
            "limnigrafo_codigo",
            "medicion_id",
            "fecha_leida",
            "condicion",
            "condicion_activa",
            "fecha_cierre",
        ]
        read_only_fields = [
            "id",
            "alerta_id",
            "tipo",
            "fecha_hora",
            "descripcion",
            "limnigrafo",
            "limnigrafo_codigo",
            "medicion_id",
            "fecha_leida",
            "condicion",
            "condicion_activa",
            "fecha_cierre",
        ]

    def update(self, instance, validated_data):
        estado = validated_data.get("estado")
        if estado == "leido" and instance.estado != "leido":
            instance.fecha_leida = timezone.now()
        instance.estado = estado or instance.estado
        instance.save(update_fields=["estado", "fecha_leida"])
        return instance
