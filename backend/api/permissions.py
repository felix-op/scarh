from rest_framework import permissions
from rest_framework_api_key.permissions import HasAPIKey 
from rest_framework.permissions import IsAuthenticated

class IsAutomaticOrManual(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return IsAuthenticated().has_permission(request, view)
        elif request.method == 'POST':
            if HasAPIKey().has_permission(request, view):
                return True
            if request.user and request.user.is_authenticated:
                return True
            return False