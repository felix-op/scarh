from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Rol

class RolInline(admin.TabularInline):
    model = Rol.usuarios.through
    extra = 1
    verbose_name = "Rol asignado"
    verbose_name_plural = "Roles asignados"

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    inlines = [RolInline]
    fieldsets = UserAdmin.fieldsets + (
        ('Información de SCARH', {'fields': ('legajo',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información de SCARH', {
            'classes': ('wide',),
            'fields': ('legajo', 'email'),
        }),
    )
    list_display = UserAdmin.list_display + ('legajo',)

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

