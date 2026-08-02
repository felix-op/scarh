from collections import defaultdict

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Limnigrafo, Medicion
from ..permissions import EstadisticasPermission
from ..serializer import (
    EstadisticaInputSerializer,
    EstadisticaOutputSerializer,
    EstadisticaTablaInputSerializer,
    EstadisticaTablaOutputSerializer,
)
from ..utils.estadisticas import (
    AGRUPACION_DISPOSITIVO,
    calcular_estadisticas,
    clave_de_medicion,
    generar_periodos,
)


class EstadisticaViewSet(viewsets.GenericViewSet):
    """
    Estadísticas descriptivas sobre mediciones. Sólo lectura, nada se persiste.

    - `GET /estadistica/` — endpoint legacy, una fila por limnígrafo. Se mantiene
      por compatibilidad con el frontend anterior; no agregarle funcionalidad.
    - `GET /estadisticas/tabla/` — endpoint actual, agrupa por dispositivo o por
      período y devuelve además promedio y cantidad de registros.
    """

    serializer_class = EstadisticaInputSerializer
    permission_classes = [IsAuthenticated, EstadisticasPermission]
    http_method_names = ['get', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'tabla':
            return EstadisticaTablaInputSerializer
        return EstadisticaInputSerializer

    # ------------------------------------------------------------------ #
    # Endpoint legacy
    # ------------------------------------------------------------------ #

    def list(self, request):
        datos = self._validar(request, EstadisticaInputSerializer)

        atributo = datos['atributo']
        resultados = []
        todos_los_valores = []

        for limnigrafo_id in datos['limnigrafos']:
            valores = list(
                Medicion.objects.filter(
                    limnigrafo_id=limnigrafo_id,
                    fecha_hora__range=[datos['fecha_inicio'], datos['fecha_fin']],
                ).values_list(atributo, flat=True)
            )
            limpios = [valor for valor in valores if valor is not None]
            todos_los_valores.extend(limpios)

            fila = self._formato_legacy(calcular_estadisticas(limpios))
            fila['id'] = limnigrafo_id
            fila['atributo'] = atributo
            resultados.append(fila)

        if len(datos['limnigrafos']) > 1:
            global_stats = self._formato_legacy(calcular_estadisticas(todos_los_valores))
            global_stats['id'] = None
            global_stats['atributo'] = atributo
            resultados.append(global_stats)

        return Response(
            EstadisticaOutputSerializer(resultados, many=True).data,
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def _formato_legacy(estadisticas):
        """
        Adapta la salida de `calcular_estadisticas` al contrato viejo: `0.0` en
        lugar de `None` (salvo la moda, que ya era nullable) y sin `promedio` ni
        `total_registros`. El contrato nuevo vive en `/estadisticas/tabla/`.
        """
        return {
            "maximo": estadisticas["maximo"] if estadisticas["maximo"] is not None else 0.0,
            "minimo": estadisticas["minimo"] if estadisticas["minimo"] is not None else 0.0,
            "mediana": estadisticas["mediana"] if estadisticas["mediana"] is not None else 0.0,
            "moda": estadisticas["moda"],
            "desvio_estandar": (
                estadisticas["desvio_estandar"] if estadisticas["desvio_estandar"] is not None else 0.0
            ),
            "percentil_90": (
                estadisticas["percentil_90"] if estadisticas["percentil_90"] is not None else 0.0
            ),
        }

    # ------------------------------------------------------------------ #
    # Endpoint de tabla
    # ------------------------------------------------------------------ #

    @action(detail=False, methods=['get'], url_path='tabla')
    def tabla(self, request):
        """
        Tabla de estadísticas descriptivas, agrupada por dispositivo o por período.

        Query params: `limnigrafos` (IDs separados por coma), `atributo`,
        `fecha_inicio`, `fecha_fin` y `agrupar_por`.
        """
        datos = self._validar(request, EstadisticaTablaInputSerializer)

        codigos = self._codigos_de_limnigrafos(datos['limnigrafos'])

        # Una sola consulta para todo el rango: agrupar en Python cuesta bastante
        # menos que una consulta por fila, y la agrupación por período necesita
        # las fechas de todos modos.
        mediciones = list(
            Medicion.objects.filter(
                limnigrafo_id__in=datos['limnigrafos'],
                fecha_hora__range=[datos['fecha_inicio'], datos['fecha_fin']],
            )
            .exclude(**{f"{datos['atributo']}__isnull": True})
            .values_list('limnigrafo_id', 'fecha_hora', datos['atributo'])
        )

        if datos['agrupar_por'] == AGRUPACION_DISPOSITIVO:
            filas, total = self._agrupar_por_dispositivo(datos, codigos, mediciones)
        else:
            filas, total = self._agrupar_por_periodo(datos, mediciones)

        salida = EstadisticaTablaOutputSerializer({
            "atributo": datos['atributo'],
            "agrupar_por": datos['agrupar_por'],
            "fecha_inicio": datos['fecha_inicio'],
            "fecha_fin": datos['fecha_fin'],
            "filas": filas,
            "total": total,
        })
        return Response(salida.data, status=status.HTTP_200_OK)

    def _agrupar_por_dispositivo(self, datos, codigos, mediciones):
        """Una fila por limnígrafo pedido, más la fila global si hay más de uno."""
        valores_por_limnigrafo = defaultdict(list)
        for limnigrafo_id, _fecha_hora, valor in mediciones:
            valores_por_limnigrafo[limnigrafo_id].append(valor)

        filas = []
        for limnigrafo_id in datos['limnigrafos']:
            filas.append(self._fila(
                clave=str(limnigrafo_id),
                etiqueta=codigos[limnigrafo_id],
                limnigrafo=limnigrafo_id,
                valores=valores_por_limnigrafo.get(limnigrafo_id, []),
            ))

        total = None
        if len(datos['limnigrafos']) > 1:
            total = self._fila(
                clave="global",
                etiqueta="Global",
                limnigrafo=None,
                valores=[valor for _id, _fecha, valor in mediciones],
            )

        return filas, total

    def _agrupar_por_periodo(self, datos, mediciones):
        """
        Una fila por período del rango, del mismo limnígrafo, más el total del rango.

        Se emiten también los períodos sin mediciones: un mes vacío es información
        y desaparecerlo de la tabla haría creer que el rango era más corto.
        """
        limnigrafo_id = datos['limnigrafos'][0]

        try:
            periodos = generar_periodos(datos['fecha_inicio'], datos['fecha_fin'], datos['agrupar_por'])
        except ValueError as exc:
            raise ValidationError({"agrupar_por": str(exc)}) from exc

        valores_por_clave = defaultdict(list)
        for _limnigrafo_id, fecha_hora, valor in mediciones:
            valores_por_clave[clave_de_medicion(fecha_hora, datos['agrupar_por'])].append(valor)

        filas = [
            self._fila(
                clave=clave,
                etiqueta=clave,
                limnigrafo=limnigrafo_id,
                valores=valores_por_clave.get(clave, []),
                periodo_inicio=inicio,
                periodo_fin=fin,
            )
            for clave, inicio, fin in periodos
        ]

        total = self._fila(
            clave="total",
            etiqueta="Total del rango",
            limnigrafo=limnigrafo_id,
            valores=[valor for _id, _fecha, valor in mediciones],
            periodo_inicio=datos['fecha_inicio'],
            periodo_fin=datos['fecha_fin'],
        )

        return filas, total

    @staticmethod
    def _fila(clave, etiqueta, limnigrafo, valores, periodo_inicio=None, periodo_fin=None):
        fila = {
            "clave": clave,
            "etiqueta": etiqueta,
            "limnigrafo": limnigrafo,
            "periodo_inicio": periodo_inicio,
            "periodo_fin": periodo_fin,
        }
        fila.update(calcular_estadisticas(valores))
        return fila

    # ------------------------------------------------------------------ #
    # Auxiliares
    # ------------------------------------------------------------------ #

    def _validar(self, request, serializer_class):
        """
        Arma el payload a partir de la query string y lo valida.

        `limnigrafos` viaja como lista separada por comas porque es un GET; el
        resto de los parámetros se pasan tal cual al serializer.
        """
        limnigrafos_param = request.query_params.get("limnigrafos", "").strip()

        limnigrafos = []
        if limnigrafos_param:
            try:
                limnigrafos = [
                    int(item.strip())
                    for item in limnigrafos_param.split(",")
                    if item.strip()
                ]
            except ValueError as exc:
                raise ValidationError({
                    "limnigrafos": "Debe ser una lista de IDs numéricos separados por coma."
                }) from exc

        payload = {
            "limnigrafos": limnigrafos,
            "atributo": request.query_params.get("atributo"),
            "fecha_inicio": request.query_params.get("fecha_inicio"),
            "fecha_fin": request.query_params.get("fecha_fin"),
        }

        agrupar_por = request.query_params.get("agrupar_por")
        if agrupar_por is not None:
            payload["agrupar_por"] = agrupar_por

        serializer = serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    @staticmethod
    def _codigos_de_limnigrafos(ids):
        """
        Mapa `id -> codigo` de los limnígrafos pedidos.

        Un ID inexistente es un error del cliente, no una fila vacía: devolver
        estadísticas en `null` para un sensor que no existe esconde el bug.
        """
        codigos = dict(Limnigrafo.objects.filter(id__in=ids).values_list('id', 'codigo'))

        faltantes = [str(limnigrafo_id) for limnigrafo_id in ids if limnigrafo_id not in codigos]
        if faltantes:
            raise ValidationError({
                "limnigrafos": f"No existen los limnígrafos con ID: {', '.join(faltantes)}."
            })

        return codigos
