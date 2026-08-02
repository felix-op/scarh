from rest_framework import serializers


class DashboardUltimaMedicionSerializer(serializers.Serializer):
    """
    @property {datetime} fecha_hora Momento de la última medición recibida.
    @property {float} altura_agua Altura registrada.
    @property {float} [nivel_de_bateria] Nivel de batería, si el sensor lo reportó.
    """

    fecha_hora = serializers.DateTimeField()
    altura_agua = serializers.FloatField()
    nivel_de_bateria = serializers.FloatField(allow_null=True)


class DashboardLimnigrafoSerializer(serializers.Serializer):
    """
    Estado de un limnígrafo para el tablero.

    @property {int} id Identificador del limnígrafo.
    @property {str} codigo Código visible.
    @property {str} estado_medicion `normal` o `fuera_de_rango`.
    @property {str} estado_conexion `en_linea`, `demorado` o `sin_conexion`.
    @property {object} [ultima_medicion] Última medición recibida, o `null`.
    """

    id = serializers.IntegerField()
    codigo = serializers.CharField()
    estado_medicion = serializers.CharField()
    estado_conexion = serializers.CharField()
    ultima_medicion = DashboardUltimaMedicionSerializer(allow_null=True)


class DashboardResumenSerializer(serializers.Serializer):
    """
    @property {int} cant_dispositivos Limnígrafos dados de alta.
    @property {object} mediciones_por_carga Conteo histórico por `fuente`, con una
        clave por cada opción declarada en el modelo (las que no tienen mediciones
        van en 0, para que el cliente no tenga que suponer las claves).
    @property {int} total_mediciones_24hs Mediciones recibidas en las últimas 24 horas.
    """

    cant_dispositivos = serializers.IntegerField()
    mediciones_por_carga = serializers.DictField(child=serializers.IntegerField())
    total_mediciones_24hs = serializers.IntegerField()


class DashboardAccionAutorSerializer(serializers.Serializer):
    """
    Autor de una acción. El `id` va para que el tablero pueda enlazar a la ficha
    del usuario.

    @property {int} id Identificador del usuario.
    @property {str} username Nombre de usuario.
    """

    id = serializers.IntegerField()
    username = serializers.CharField()


class DashboardAccionSerializer(serializers.Serializer):
    """
    Una acción del historial, en versión resumida para el tablero.

    **Se omiten `descripcion`, `entidad_id` y `metadata` a propósito.** Las
    descripciones de auditoría incluyen diffs campo a campo
    (`email: old='...' -> new='...'`, ver `utils/audit.py`) y el detalle completo
    vive en `/historial/`, que exige el rol `historial-visualizar`. Este endpoint no
    pide roles, así que se limita al pulso de actividad —quién, qué tipo de cambio,
    sobre qué clase de entidad, cuándo y con qué resultado— sin volverse una vía
    para leer el historial completo sin permiso.

    @property {int} id Identificador de la acción.
    @property {datetime} fecha_hora Momento en que ocurrió.
    @property {str} tipo_accion Clave del tipo (`created`, `modified`, ...).
    @property {str} tipo_accion_label Etiqueta legible del tipo.
    @property {str} entidad Clase de entidad afectada (`Limnígrafo`, `Medición`, ...).
    @property {str} estado `success`, `failed` o `review`.
    @property {object} [usuario] Autor de la acción, o `null` si la hizo el sistema.
    """

    id = serializers.IntegerField()
    fecha_hora = serializers.DateTimeField()
    tipo_accion = serializers.CharField()
    tipo_accion_label = serializers.CharField()
    entidad = serializers.CharField()
    estado = serializers.CharField()
    usuario = DashboardAccionAutorSerializer(allow_null=True)


class DashboardOutputSerializer(serializers.Serializer):
    """
    Salida de `/estadisticas/dashboard/`.

    @property {list} limnigrafos Estado actual de cada dispositivo.
    @property {object} resumen Totales de la instalación.
    @property {list} ultimas_acciones Últimas acciones registradas, más recientes primero.
    """


    limnigrafos = DashboardLimnigrafoSerializer(many=True)
    resumen = DashboardResumenSerializer()
    ultimas_acciones = DashboardAccionSerializer(many=True)
