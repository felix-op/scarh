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


class RoleBasedPermission(permissions.BasePermission):
    """
    Permiso base que valida roles según la acción.
    Las subclases deben definir 'resource_name' (ej: 'limnigrafos', 'mediciones').
    """
    resource_name = None  # Debe ser definido en subclases
    
    def has_permission(self, request, view):
        # Primero verificar autenticación
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuarios siempre tienen acceso
        if request.user.is_superuser:
            return True
        
        # Obtener roles del usuario
        user_roles = set(request.user.roles.values_list('nombre', flat=True))
        
        # Rol administracion tiene acceso completo
        if 'administracion' in user_roles:
            return True
        
        # Determinar qué rol se requiere según la acción
        action = getattr(view, 'action', None)
        
        # Acciones de lectura requieren rol 'visualizar'
        if action in ['list', 'retrieve'] or request.method in ['GET', 'HEAD', 'OPTIONS']:
            required_role = f'{self.resource_name}-visualizar'
            return required_role in user_roles
        
        # Acciones de escritura requieren rol 'editar'
        elif action in ['create', 'update', 'partial_update', 'destroy'] or request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            required_role = f'{self.resource_name}-editar'
            return required_role in user_roles
        
        # Por defecto, denegar si no hay acción identificada
        return False


class LimnigrafosPermission(RoleBasedPermission):
    resource_name = 'limnigrafos'


class MedicionesPermission(RoleBasedPermission):
    resource_name = 'mediciones'


class MedicionesPermissionWithAPIKey(permissions.BasePermission):
    """
    Permiso especial para mediciones que permite:
    - API Keys (limnígrafos automáticos) sin validar roles
    - Usuarios autenticados con roles mediciones-visualizar/editar
    """
    def has_permission(self, request, view):
        # Si tiene API key válida, permitir sin validar roles
        if HasAPIKey().has_permission(request, view):
            return True
        
        # Si no tiene API key, debe ser usuario autenticado con roles
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuarios siempre tienen acceso
        if request.user.is_superuser:
            return True
        
        # Validar roles mediciones-visualizar/editar
        user_roles = set(request.user.roles.values_list('nombre', flat=True))
        
        # Rol administracion tiene acceso completo
        if 'administracion' in user_roles:
            return True
        
        action = getattr(view, 'action', None)
        
        # Lectura requiere mediciones-visualizar
        if action in ['list', 'retrieve'] or request.method in ['GET', 'HEAD', 'OPTIONS']:
            return 'mediciones-visualizar' in user_roles
        
        # Escritura requiere mediciones-editar
        elif action in ['create', 'update', 'partial_update', 'destroy'] or request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return 'mediciones-editar' in user_roles
        
        return False


class UsuariosPermission(RoleBasedPermission):
    resource_name = 'usuarios'


class UbicacionesPermission(RoleBasedPermission):
    resource_name = 'ubicaciones'


class MapaPermission(RoleBasedPermission):
    resource_name = 'mapa'


class HistorialPermission(permissions.BasePermission):
    """
    Permiso para historial: solo visualizar (no editable).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        # Solo permitir lectura
        action = getattr(view, 'action', None)
        if action not in ['list', 'retrieve'] and request.method not in ['GET', 'HEAD', 'OPTIONS']:
            return False
        
        # Verificar rol historial-visualizar
        user_roles = set(request.user.roles.values_list('nombre', flat=True))
        
        # Rol administracion tiene acceso completo
        if 'administracion' in user_roles:
            return True
        
        return 'historial-visualizar' in user_roles


class EstadisticasPermission(permissions.BasePermission):
    """
    Permiso para estadísticas: solo visualizar (no persistidas).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        # Solo permitir lectura
        action = getattr(view, 'action', None)
        if action not in ['list', 'retrieve'] and request.method not in ['GET', 'HEAD', 'OPTIONS']:
            return False
        
        # Verificar rol estadisticas-visualizar
        user_roles = set(request.user.roles.values_list('nombre', flat=True))
        
        # Rol administracion tiene acceso completo
        if 'administracion' in user_roles:
            return True
        
        return 'estadisticas-visualizar' in user_roles