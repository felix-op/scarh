# ============================================================================
# SINCRONIZAR_SIMULADOR.PY - COMANDO PARA SINCRONIZAR LIMNÍGRAFOS
# ============================================================================
# Comando de Django management para sincronizar el config.yaml del simulador
# con los limnígrafos en la base de datos.
#
# USO:
#   python manage.py sincronizar_simulador
#
# FUNCIONALIDAD:
#   1. Lee todos los limnígrafos de la BD
#   2. Genera tokens JWT para cada uno
#   3. Actualiza simulator-go/config.yaml
#   4. Reinicia el contenedor del simulador
# ============================================================================

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Limnigrafo
from rest_framework_simplejwt.tokens import RefreshToken
import yaml
import os
import subprocess

Usuario = get_user_model()

class Command(BaseCommand):
    help = 'Sincroniza config.yaml del simulador con los limnígrafos en la BD'

    def handle(self, *args, **options):
        self.stdout.write("🔄 Iniciando sincronización de limnígrafos...")
        
        # Ruta al config.yaml
        config_path = '/app/simulator-go/config.yaml'
        
        if not os.path.exists(config_path):
            self.stdout.write(self.style.ERROR(f"❌ No se encontró {config_path}"))
            return
        
        # Leer configuración actual
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # Obtener todos los limnígrafos
        limnigrafos = Limnigrafo.objects.all()
        self.stdout.write(f"📊 Limnígrafos en BD: {limnigrafos.count()}")
        
        # Construir lista de limnígrafos para el simulador
        limnigrafos_config = []
        for lim in limnigrafos:
            # Crear usuario ficticio para generar token
            username = f"limnigrafo_{lim.id}"
            email = f"limnigrafo_{lim.id}@simulator.internal"
            user, created = Usuario.objects.get_or_create(
                username=username,
                defaults={
                    'is_active': True,
                    'email': email
                }
            )
            
            # Generar token JWT
            refresh = RefreshToken.for_user(user)
            token = str(refresh.access_token)
            
            limnigrafo_config = {
                'id': lim.id,
                'token': token,
                'altura_min': 0.5,
                'altura_max': 3.5,
                'temperatura_min': -5,
                'temperatura_max': 25,
                'presion_min': 950,
                'presion_max': 1050,
                'bateria_min': float(lim.bateria_min),
                'bateria_max': float(lim.bateria_max),
                'probabilidad_falla': 0.10,
                'duracion_falla_min': 20
            }
            limnigrafos_config.append(limnigrafo_config)
            
            self.stdout.write(f"  ✅ {lim.codigo} (ID: {lim.id}) - Batería: {lim.bateria_min}V-{lim.bateria_max}V")
        
        # Actualizar configuración
        config['limnigrafos'] = limnigrafos_config
        
        # Guardar archivo
        with open(config_path, 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Config.yaml actualizado con {len(limnigrafos_config)} limnígrafos"))
        
        # Reiniciar simulador
        self.stdout.write("🔄 Reiniciando simulador...")
        try:
            result = subprocess.run(
                ['docker-compose', 'restart', 'simulator'],
                cwd='/app',
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.stdout.write(self.style.SUCCESS("✅ Simulador reiniciado correctamente"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️  Error al reiniciar: {result.stderr}"))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"⚠️  No se pudo reiniciar automáticamente: {e}"))
            self.stdout.write("   Ejecuta manualmente: docker-compose restart simulator")
        
        self.stdout.write(self.style.SUCCESS("\n🎉 Sincronización completada"))
