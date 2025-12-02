from rest_framework import serializers
from ..models import Ubicacion

class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ['id', 'longitud', 'latitud', 'nombre']
        read_only_fields = ['id']

    def to_representation(self, instance):
        return {
            "type": "Feature",
            "id": instance.id,
            "geometry": {
                "type": "Point",
                "coordinates": [instance.longitud, instance.latitud]
            },
            "nombre": instance.nombre
        }



class GeometrySerializer(serializers.Serializer):
    type = serializers.CharField(default="Point")
    coordinates = serializers.ListField(
        child=serializers.FloatField(),
        min_length=2,
        max_length=2
    )

class UbicacionOutputSerializer(serializers.Serializer):
    type = serializers.CharField(default="Feature")
    id = serializers.IntegerField()
    geometry = GeometrySerializer()
    nombre = serializers.CharField()
