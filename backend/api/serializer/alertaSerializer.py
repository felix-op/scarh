from rest_framework import serializers

from ..models import Alerta


class AlertaSerializer(serializers.ModelSerializer):
    limnigrafo_codigo = serializers.CharField(source="limnigrafo.codigo", read_only=True)
    medicion_id = serializers.IntegerField(source="medicion.id", read_only=True)

    class Meta:
        model = Alerta
        fields = [
            "id",
            "estado",
            "tipo",
            "fecha_hora",
            "descripcion",
            "limnigrafo",
            "limnigrafo_codigo",
            "medicion_id",
        ]
        read_only_fields = [
            "id",
            "tipo",
            "fecha_hora",
            "descripcion",
            "limnigrafo",
            "limnigrafo_codigo",
            "medicion_id",
        ]
