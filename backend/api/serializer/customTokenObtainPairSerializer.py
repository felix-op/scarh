from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_superuser': self.user.is_superuser,
            'is_staff': self.user.is_staff,
        }

        data['access_token_lifetime'] = int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds())
        data['refresh_token_lifetime'] = int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds())
        
        return data
