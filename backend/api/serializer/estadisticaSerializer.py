from rest_framework import serializers

from ..utils.estadisticas import (
    AGRUPACION_DISPOSITIVO,
    AGRUPACIONES,
    AGRUPACIONES_PERIODO,
    ATRIBUTOS_DISPONIBLES,
)


class EstadisticaInputSerializer(serializers.Serializer):
    """Entrada del endpoint legacy `/estadistica/`. Se mantiene sin cambios."""

    limnigrafos = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    atributo = serializers.ChoiceField(
        choices=['altura_agua', 'presion', 'temperatura'],
        help_text="Opciones disponibles: altura_agua, presion, temperatura"
    )
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()

    def validate(self, data):
        if data['fecha_inicio'] > data['fecha_fin']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")
        return data


class EstadisticaOutputSerializer(serializers.Serializer):
    """Salida del endpoint legacy `/estadistica/`. Se mantiene sin cambios."""

    id = serializers.IntegerField(allow_null=True)
    maximo = serializers.FloatField()
    minimo = serializers.FloatField()
    mediana = serializers.FloatField()
    atributo = serializers.CharField()
    moda = serializers.FloatField(allow_null=True)
    desvio_estandar = serializers.FloatField()
    percentil_90 = serializers.FloatField()


class EstadisticaTablaInputSerializer(serializers.Serializer):
    """
    Entrada de `/estadisticas/tabla/`.

    @property {list[int]} limnigrafos IDs de los limnígrafos a analizar. No puede ir vacío.
    @property {str} atributo Variable a resumir. Ver `ATRIBUTOS_DISPONIBLES`.
    @property {datetime} fecha_inicio Comienzo del rango, inclusive.
    @property {datetime} fecha_fin Fin del rango, inclusive.
    @property {str} agrupar_por Eje de comparación: `dispositivo` (una fila por
        limnígrafo) o `dia`/`semana`/`mes`/`anio` (una fila por período).
    """

    limnigrafos = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )
    atributo = serializers.ChoiceField(
        choices=ATRIBUTOS_DISPONIBLES,
        help_text=f"Opciones disponibles: {', '.join(ATRIBUTOS_DISPONIBLES)}",
    )
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()
    agrupar_por = serializers.ChoiceField(
        choices=AGRUPACIONES,
        default=AGRUPACION_DISPOSITIVO,
        help_text=f"Opciones disponibles: {', '.join(AGRUPACIONES)}",
    )

    def validate(self, data):
        if data['fecha_inicio'] > data['fecha_fin']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin.")

        if data['agrupar_por'] in AGRUPACIONES_PERIODO and len(set(data['limnigrafos'])) != 1:
            raise serializers.ValidationError({
                "limnigrafos": (
                    "La agrupación por período compara períodos de un mismo sensor, "
                    "así que requiere exactamente un limnígrafo."
                )
            })

        return data


class EstadisticaFilaSerializer(serializers.Serializer):
    """
    Una fila de la tabla de estadísticas. Qué representa depende de `agrupar_por`:
    un limnígrafo o un período.

    Todas las métricas son `null` cuando la fila no tiene mediciones. `0.0` sería
    un valor plausible de altura o temperatura y haría indistinguible "sin datos"
    de "el valor fue cero".

    @property {str} clave Identificador estable de la fila (ID del limnígrafo o
        clave del período: `2026-01-15`, `2026-W03`, `2026-01`, `2026`).
    @property {str} etiqueta Texto sugerido para la primera columna.
    @property {int} [limnigrafo] ID del limnígrafo, o `null` en la fila global.
    @property {datetime} [periodo_inicio] Comienzo del período, sólo en agrupación temporal.
    @property {datetime} [periodo_fin] Fin exclusivo del período, sólo en agrupación temporal.
    @property {int} total_registros Cantidad de mediciones con valor en la fila.
    @property {float} [minimo] Valor mínimo.
    @property {float} [maximo] Valor máximo.
    @property {float} [promedio] Media aritmética.
    @property {float} [mediana] Mediana.
    @property {float} [moda] Moda agrupada a 2 decimales.
    @property {float} [desvio_estandar] Desvío muestral (n-1). `null` con menos de 2 registros.
    @property {float} [percentil_90] Percentil 90 por interpolación lineal.
    """

    clave = serializers.CharField()
    etiqueta = serializers.CharField()
    limnigrafo = serializers.IntegerField(allow_null=True)
    periodo_inicio = serializers.DateTimeField(allow_null=True)
    periodo_fin = serializers.DateTimeField(allow_null=True)
    total_registros = serializers.IntegerField()
    minimo = serializers.FloatField(allow_null=True)
    maximo = serializers.FloatField(allow_null=True)
    promedio = serializers.FloatField(allow_null=True)
    mediana = serializers.FloatField(allow_null=True)
    moda = serializers.FloatField(allow_null=True)
    desvio_estandar = serializers.FloatField(allow_null=True)
    percentil_90 = serializers.FloatField(allow_null=True)


class EstadisticaTablaOutputSerializer(serializers.Serializer):
    """
    Salida de `/estadisticas/tabla/`.

    El envoltorio existe para que el cliente sepa qué le contestaron sin tener que
    recordar qué pidió, y para separar la fila agregada de las filas de datos en
    lugar de esconderla al final del array con `id: null`.

    @property {str} atributo Variable resumida.
    @property {str} agrupar_por Eje de comparación aplicado.
    @property {datetime} fecha_inicio Comienzo del rango analizado.
    @property {datetime} fecha_fin Fin del rango analizado.
    @property {list} filas Filas de datos, en orden de presentación.
    @property {object} [total] Fila agregada sobre todas las filas. `null` cuando
        no aporta nada (agrupación por dispositivo con un solo limnígrafo).
    """

    atributo = serializers.CharField()
    agrupar_por = serializers.CharField()
    fecha_inicio = serializers.DateTimeField()
    fecha_fin = serializers.DateTimeField()
    filas = EstadisticaFilaSerializer(many=True)
    total = EstadisticaFilaSerializer(allow_null=True)
