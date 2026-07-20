from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..permissions import EstadisticasPermission
from ..models import Medicion
from ..serializer import EstadisticaInputSerializer, EstadisticaOutputSerializer
from collections import Counter
import statistics
import math
from rest_framework.exceptions import ValidationError

class EstadisticaViewSet(viewsets.GenericViewSet):
    serializer_class = EstadisticaInputSerializer
    permission_classes = [IsAuthenticated, EstadisticasPermission]
    http_method_names = ['get', 'head', 'options']

    def list(self, request):
        limnigrafos_param = request.query_params.get("limnigrafos", "").strip()
        atributo = request.query_params.get("atributo")
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        limnigrafos = []
        if limnigrafos_param:
            try:
                limnigrafos = [
                    int(item.strip())
                    for item in limnigrafos_param.split(",")
                    if item.strip()
                ]
            except ValueError as exc:
                raise ValidationError({"limnigrafos": "Debe ser una lista de IDs numéricos separados por coma."}) from exc

        serializer = self.get_serializer(
            data={
                "limnigrafos": limnigrafos,
                "atributo": atributo,
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
            }
        )
        serializer.is_valid(raise_exception=True)
        return Response(self._calcular_resultados(serializer.validated_data), status=status.HTTP_200_OK)

    def _calcular_resultados(self, data):
        limnigrafos_ids = data['limnigrafos']
        atributo = data['atributo']
        fecha_inicio = data['fecha_inicio']
        fecha_fin = data['fecha_fin']

        resultados = []
        all_values = []

        for limnigrafo_id in limnigrafos_ids:
            values = list(Medicion.objects.filter(
                limnigrafo_id=limnigrafo_id,
                fecha_hora__range=[fecha_inicio, fecha_fin]
            ).values_list(atributo, flat=True))
            
            clean_values = [v for v in values if v is not None]
            all_values.extend(clean_values)

            stats = self._calcular_estadisticas(clean_values)
            stats['id'] = limnigrafo_id
            stats['atributo'] = atributo
            resultados.append(stats)

        if len(limnigrafos_ids) > 1:
            global_stats = self._calcular_estadisticas(all_values)
            global_stats['id'] = None
            global_stats['atributo'] = atributo
            resultados.append(global_stats)

        output_serializer = EstadisticaOutputSerializer(resultados, many=True)
        return output_serializer.data

    def _calcular_estadisticas(self, values):
        if not values:
            return {
                "maximo": 0.0,
                "minimo": 0.0,
                "mediana": 0.0,
                "moda": None,
                "desvio_estandar": 0.0,
                "percentil_90": 0.0
            }
        
        max_val = max(values)
        min_val = min(values)
        
        if len(values) > 1:
            std_dev = statistics.stdev(values)
        else:
            std_dev = 0.0

        values.sort()
        k = (len(values) - 1) * 0.9
        f = math.floor(k)
        c = math.ceil(k)
        
        if f == c:
            percentil_90 = values[int(k)]
        else:
            d0 = values[int(f)] * (c - k)
            d1 = values[int(c)] * (k - f)
            percentil_90 = d0 + d1

        moda = self._calcular_moda(values)
        mediana = statistics.median(values)

        return {
            "maximo": max_val,
            "minimo": min_val,
            "mediana": mediana,
            "moda": moda,
            "desvio_estandar": std_dev,
            "percentil_90": percentil_90
        }

    def _calcular_moda(self, values, decimales=2):
        if not values:
            return None

        # Moda agrupada: agrupa valores por redondeo para evitar que pequeñas
        # variaciones decimales de sensores anulen la moda.
        valores_agrupados = [round(value, decimales) for value in values]
        frecuencias = Counter(valores_agrupados)
        max_frecuencia = max(frecuencias.values(), default=0)

        modas = [value for value, frecuencia in frecuencias.items() if frecuencia == max_frecuencia]
        return min(modas) if modas else None
        
