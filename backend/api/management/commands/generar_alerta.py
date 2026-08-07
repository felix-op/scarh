from django.core.management.base import BaseCommand
from api.models import Limnigrafo
from api.utils.estado_limnigrafo import (
    calcular_estado_limnigrafo,
    calcular_estado_medicion_limnigrafo,
)
from api.utils.alertas import generar_alerta_cambio_estado
from django.db import transaction

class Command(BaseCommand):
    help = "Revisa el estado de conexión de todos los limnígrafos y actualiza sus estados, generando alertas si corresponde."

    def handle(self, *args, **options):
        self.stdout.write("Iniciando verificación de conexión de limnígrafos...")

        limnigrafos = Limnigrafo.objects.all().select_related('ultima_medicion')

        actualizados = 0
        cambios = []

        with transaction.atomic():
            for lim in limnigrafos:
                estado_anterior = lim.estado
                estado_medicion_anterior = lim.estado_medicion
                nuevo_estado = calcular_estado_limnigrafo(lim)
                nuevo_estado_medicion = calcular_estado_medicion_limnigrafo(lim)

                if nuevo_estado != estado_anterior or nuevo_estado_medicion != estado_medicion_anterior:
                    lim.estado = nuevo_estado
                    lim.estado_medicion = nuevo_estado_medicion
                    lim.save(update_fields=['estado', 'estado_medicion'])
                    actualizados += 1
                    cambios.append((lim.codigo, estado_anterior, nuevo_estado))

                # Se llama siempre, no sólo cuando el estado cambió: la función es
                # idempotente (no duplica alertas de una condición ya activa) y además
                # es la que **cierra** las condiciones que dejaron de cumplirse. Si sólo
                # se la llamara al cambiar de estado, una alerta resuelta quedaría
                # activa para siempre.
                generar_alerta_cambio_estado(
                    limnigrafo=lim,
                    estado_anterior=estado_anterior,
                    nuevo_estado=nuevo_estado,
                    medicion=lim.ultima_medicion,
                )

        for codigo, estado_anterior, nuevo_estado in cambios:
            self.stdout.write(
                self.style.SUCCESS(
                    f"🔄 Limnígrafo {codigo} cambió de estado: {estado_anterior} ➡️ {nuevo_estado}."
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Verificación terminada. Limnígrafos actualizados: {actualizados}."
            )
        )
