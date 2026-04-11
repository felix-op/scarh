import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models.rol import Rol

class Command(BaseCommand):
    help = "Crea un superusuario basado en variables de entorno (ADMIN_*) si no existe."

    def handle(self, *args, **options):
        User = get_user_model()

        USERNAME = os.environ.get('ADMIN_USERNAME')
        EMAIL = os.environ.get('ADMIN_EMAIL')
        PASSWORD = os.environ.get('ADMIN_PASSWORD')
        
        FIRST_NAME = os.environ.get('ADMIN_FIRST_NAME', '')
        LAST_NAME = os.environ.get('ADMIN_LAST_NAME', '')
        IS_STAFF = os.environ.get('ADMIN_IS_STAFF', 'False').lower() in ('true', '1', 't')

        if not all([USERNAME, EMAIL, PASSWORD]):
            self.stdout.write(self.style.ERROR('🚨 ERROR: ADMIN_USERNAME, ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en el entorno.'))
            return

        if User.objects.filter(username=USERNAME).exists():
            self.stdout.write(self.style.WARNING(f'⚠️ Superusuario "{USERNAME}" ya existe. Omitiendo creación.'))
        else:
            try:
                user = User.objects.create_superuser(
                    username=USERNAME,
                    email=EMAIL,
                    password=PASSWORD,
                    first_name=FIRST_NAME,
                    last_name=LAST_NAME,
                    is_staff=IS_STAFF, 
                )

                # Asignar rol de administración
                
                rol_admin, _ = Rol.objects.get_or_create(
                    nombre="administracion",
                    defaults={"descripcion": "Permite acceso total a todas las funcionalidades de administración"}
                )
                user.roles.add(rol_admin)

                self.stdout.write(self.style.SUCCESS(f'✅ Superusuario "{USERNAME}" creado exitosamente.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ Error al crear superusuario: {e}'))

        # Lógica añadida para crear también un usuario común (no admin) si está en el .env
        COM_USERNAME = os.environ.get('USER_USERNAME')
        COM_EMAIL = os.environ.get('USER_EMAIL')
        COM_PASSWORD = os.environ.get('USER_PASSWORD')

        if COM_USERNAME and COM_EMAIL and COM_PASSWORD:
            if User.objects.filter(username=COM_USERNAME).exists():
                self.stdout.write(self.style.WARNING(f'⚠️ Usuario común "{COM_USERNAME}" ya existe.'))
            else:
                try:
                    User.objects.create_user(
                        username=COM_USERNAME,
                        email=COM_EMAIL,
                        password=COM_PASSWORD,
                        first_name=os.environ.get('USER_FIRST_NAME', ''),
                        last_name=os.environ.get('USER_LAST_NAME', ''),
                    )
                    self.stdout.write(self.style.SUCCESS(f'✅ Usuario común "{COM_USERNAME}" creado exitosamente.'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'❌ Error al crear usuario común: {e}'))