from rest_framework import serializers
from ..models import Accion

class HistorialListSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source="fecha_hora")
    username = serializers.SerializerMethodField()
    type = serializers.CharField(source="tipo_accion")
    model_name = serializers.CharField(source="entidad")
    object_id = serializers.CharField(source="entidad_id")
    object_repr = serializers.CharField(source="descripcion")
    description = serializers.CharField(source="descripcion")
    status = serializers.CharField(source="estado")

    class Meta:
        model = Accion
        fields = [
            "id",
            "date",
            "type",
            "object_id",
            "model_name",
            "username",
            "object_repr",
            "description",
            "status",
        ]

    def get_username(self, obj):
        return obj.usuario.username if obj.usuario else "Sistema"


class HistorialDetailSerializer(HistorialListSerializer):
    metadata = serializers.JSONField()

    class Meta(HistorialListSerializer.Meta):
        fields = HistorialListSerializer.Meta.fields + ["metadata"]
