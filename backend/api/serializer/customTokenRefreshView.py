from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['access_token_lifetime'] = int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds())
        data['refresh_token_lifetime'] = int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds())

        return data