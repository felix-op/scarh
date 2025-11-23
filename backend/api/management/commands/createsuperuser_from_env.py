import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

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
            return

        try:
            User.objects.create_superuser(
                username=USERNAME,
                email=EMAIL,
                password=PASSWORD,
                first_name=FIRST_NAME,
                last_name=LAST_NAME,
                is_staff=IS_STAFF, 
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Superusuario "{USERNAME}" creado exitosamente.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error al crear superusuario: {e}'))