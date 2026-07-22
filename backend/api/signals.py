# ============================================================================
# SIGNALS.PY - SEÑALES PARA SINCRONIZAR LIMNÍGRAFOS CON SIMULADOR
# ============================================================================
# Este archivo maneja la sincronización automática entre la BD y el simulador.
#
# FUNCIONALIDAD:
#   - post_save: Cuando se crea/actualiza un limnígrafo → actualiza config.yaml
#   - post_delete: Cuando se elimina un limnígrafo → actualiza config.yaml
#
# FLUJO:
#   1. Usuario crea limnígrafo en Django Admin o API
#   2. Signal detecta la creación
#   3. Llama al comando sincronizar_simulador
#   4. Config.yaml se actualiza con tokens JWT
#   5. Simulador se reinicia automáticamente
# ============================================================================

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Limnigrafo
from django.core.management import call_command
import threading

def sincronizar_async():
    """Ejecuta la sincronización en un hilo separado para no bloquear"""
    try:
        # call_command('sincronizar_simulador')
        pass
    except Exception as e:
        print(f"⚠️  Error al sincronizar: {e}")

@receiver(post_save, sender=Limnigrafo)
def limnigrafo_creado_actualizado(sender, instance, created, **kwargs):
    """Signal cuando se crea o actualiza un limnígrafo"""
    if created:
        print(f"🆕 Nuevo limnígrafo creado: {instance.codigo} (ID: {instance.id})")
        # Sincronizar en segundo plano
        thread = threading.Thread(target=sincronizar_async)
        thread.daemon = True
        thread.start()

@receiver(post_delete, sender=Limnigrafo)
def limnigrafo_eliminado(sender, instance, **kwargs):
    """Signal cuando se elimina un limnígrafo"""
    print(f"🗑️  Limnígrafo eliminado: {instance.codigo} (ID: {instance.id})")
    # Sincronizar en segundo plano
    thread = threading.Thread(target=sincronizar_async)
    thread.daemon = True
    thread.start()

