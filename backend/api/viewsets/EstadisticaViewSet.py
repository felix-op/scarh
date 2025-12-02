from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from ..models import Medicion
from ..serializer import EstadisticaInputSerializer, EstadisticaOutputSerializer
import statistics
import math

class EstadisticaViewSet(viewsets.GenericViewSet):
    serializer_class = EstadisticaInputSerializer

    @extend_schema(
        request=EstadisticaInputSerializer,
        responses={200: EstadisticaOutputSerializer(many=True)}
    )
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
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
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    def _calcular_estadisticas(self, values):
        if not values:
            return {
                "maximo": 0.0,
                "minimo": 0.0,
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

        return {
            "maximo": max_val,
            "minimo": min_val,
            "desvio_estandar": std_dev,
            "percentil_90": percentil_90
        }
        

