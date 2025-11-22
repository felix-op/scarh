from rest_framework import serializers
from ..models import Limnigrafo

class HistorialListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='history_id')
    object_id = serializers.IntegerField(source='id')
    date = serializers.DateTimeField(source='history_date')
    username = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()
    object_repr = serializers.SerializerMethodField()

    class Meta:
        model = Limnigrafo.history.model
        fields = [
            'id', 
            'date', 
            'type', 
            'object_id', 
            'model_name', 
            'username', 
            'object_repr'
        ]

    def get_username(self, obj):
        return obj.history_user.username if obj.history_user else "Sistema"

    def get_type(self, obj):
        mapa = {'+': 'created', '~': 'modified', '-': 'deleted'}
        return mapa.get(obj.history_type, 'unknown')

    def get_model_name(self, obj):
        return "Limnígrafo"

    def get_object_repr(self, obj):
        return str(obj)


class HistorialDetailSerializer(HistorialListSerializer):
    changes = serializers.SerializerMethodField()

    class Meta(HistorialListSerializer.Meta):
        fields = HistorialListSerializer.Meta.fields + ['changes']

    def get_changes(self, obj):
        changes = []
        if obj.prev_record: #prev record trae el estado anterior
            delta = obj.diff_against(obj.prev_record)
            
            for change in delta.changes:
                changes.append({
                    "field": change.field,
                    "old_value": change.old,
                    "new_value": change.new
                })
        return changes