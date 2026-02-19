from rest_framework import serializers
from django.contrib.auth import authenticate

class ChangePasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(required=True)
    password_nueva = serializers.CharField(required=True)

    def validate_password_actual(self, value):
        user = self.context.get('target_user') or self.context['request'].user
        
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value
