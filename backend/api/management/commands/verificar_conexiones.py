from django.core.management.base import BaseCommand
from api.models import Limnigrafo
from api.utils.estado_limnigrafo import calcular_estado_limnigrafo
from api.utils.alertas import generar_alerta_cambio_estado
from django.db import transaction

class Command(BaseCommand):
    help = "Revisa el estado de conexión de todos los limnígrafos y actualiza sus estados, generando alertas si corresponde."

    def handle(self, *args, **options):
        self.stdout.write("Iniciando verificación de conexión de limnígrafos...")
        
        limnigrafos = Limnigrafo.objects.all().select_related('ultima_medicion')
        
        actualizados = 0
        alertas_generadas = 0
        
        with transaction.atomic():
            for lim in limnigrafos:
                estado_anterior = lim.estado
                nuevo_estado = calcular_estado_limnigrafo(lim)
                
                if nuevo_estado != estado_anterior:
                    lim.estado = nuevo_estado
                    lim.save(update_fields=['estado'])
                    actualizados += 1
                    
                    generar_alerta_cambio_estado(
                        limnigrafo=lim,
                        estado_anterior=estado_anterior,
                        nuevo_estado=nuevo_estado
                    )
                    alertas_generadas += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"🔄 Limnígrafo {lim.codigo} cambió de estado: {estado_anterior} ➡️ {nuevo_estado}."
                        )
                    )
                    
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Verificación terminada. Limnígrafos actualizados: {actualizados}. Alertas creadas: {alertas_generadas}."
            )
        )
