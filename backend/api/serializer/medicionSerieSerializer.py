from rest_framework import serializers

from ..utils.estadisticas import ATRIBUTOS_DISPONIBLES
from ..utils.series import (
    MAX_PUNTOS_DEFECTO,
    MAX_PUNTOS_PERMITIDO,
    MIN_PUNTOS_PERMITIDO,
)


class MedicionSerieInputSerializer(serializers.Serializer):
    """
    Entrada de `/medicion/serie/`.

    @property {list[int]} limnigrafos IDs de los limnígrafos a graficar. No puede ir vacío.
    @property {str} atributo Variable a graficar.
    @property {datetime} fecha_inicio Comienzo del rango.
    @property {datetime} fecha_fin Fin del rango.
    @property {int} max_puntos Techo de puntos por serie. El servidor puede devolver
        menos si los datos no dan para tanta resolución.
    """

    limnigrafos = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    atributo = serializers.ChoiceField(
        choices=ATRIBUTOS_DISPONIBLES,
        help_text=f"Opciones disponibles: {', '.join(ATRIBUTOS_DISPONIBLES)}",
    )
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()
    max_puntos = serializers.IntegerField(
        default=MAX_PUNTOS_DEFECTO,
        min_value=MIN_PUNTOS_PERMITIDO,
        max_value=MAX_PUNTOS_PERMITIDO,
    )

    def validate(self, data):
        if data['fecha_inicio'] >= data['fecha_fin']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        return data


class MedicionSeriePuntoSerializer(serializers.Serializer):
    """
    Una cubeta de la serie.

    Se devuelven mínimo y máximo además del promedio para poder dibujar una banda:
    promediar solo aplana justamente los picos de crecida que el gráfico existe
    para detectar. Con la banda, un pico de 20 minutos sobrevive a una cubeta de
    3 horas.

    Una cubeta con `total_registros = 0` es un tramo sin mediciones, y sus valores
    son `null`. El gráfico tiene que cortar la línea ahí, no interpolar.

    @property {datetime} inicio Comienzo de la cubeta.
    @property {int} total_registros Mediciones con valor dentro de la cubeta.
    @property {float} [minimo] Valor mínimo de la cubeta.
    @property {float} [maximo] Valor máximo de la cubeta.
    @property {float} [promedio] Media de la cubeta.
    """

    inicio = serializers.DateTimeField()
    total_registros = serializers.IntegerField()
    minimo = serializers.FloatField(allow_null=True)
    maximo = serializers.FloatField(allow_null=True)
    promedio = serializers.FloatField(allow_null=True)


class MedicionSerieSerializer(serializers.Serializer):
    """
    Serie de un limnígrafo.

    @property {int} limnigrafo ID del limnígrafo.
    @property {str} codigo Código del limnígrafo, para la leyenda del gráfico.
    @property {int} total_registros Mediciones del dispositivo en todo el rango.
    @property {list} puntos Cubetas, en orden cronológico. Todas las series
        comparten la misma grilla, así que se pueden superponer directamente.
    """

    limnigrafo = serializers.IntegerField()
    codigo = serializers.CharField()
    total_registros = serializers.IntegerField()
    puntos = MedicionSeriePuntoSerializer(many=True)


class MedicionSerieOutputSerializer(serializers.Serializer):
    """
    Salida de `/medicion/serie/`.

    @property {str} atributo Variable graficada.
    @property {datetime} fecha_inicio Comienzo del rango analizado.
    @property {datetime} fecha_fin Fin del rango analizado.
    @property {int} bucket_segundos Ancho de cubeta elegido por el servidor. El
        cliente lo necesita para rotular la resolución ("1 punto cada 3 h") y para
        que nadie lea un valor puntual donde hay un rango.
    @property {int} total_puntos Cantidad de cubetas de cada serie.
    @property {list} series Una por limnígrafo pedido, en el orden en que se pidieron.
    """

    atributo = serializers.CharField()
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()
    bucket_segundos = serializers.IntegerField()
    total_puntos = serializers.IntegerField()
    series = MedicionSerieSerializer(many=True)
