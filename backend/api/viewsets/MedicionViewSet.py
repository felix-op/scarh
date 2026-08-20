from collections import Counter

from django.db import transaction
from django.db.models import Avg, Count, F, Max, Min, Q, Value
from django.db.models import DateTimeField as DateTimeOutputField
from django.db.models import DurationField as DurationOutputField
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Medicion, Limnigrafo
from ..serializer import (
    MedicionImportPayloadSerializer,
    MedicionImportRowSerializer,
    MedicionSerializer,
    MedicionSerieInputSerializer,
    MedicionSerieOutputSerializer,
)
from ..permissions import MedicionesPermissionWithAPIKey
from ..filters import MedicionFilter
from ..utils.series import DateBin, elegir_bucket, generar_grilla, origen_de_cubetas
from ..utils.audit import registrar_accion_auditoria_en_commit
from ..utils.alertas import generar_alerta_medicion_fuera_de_rango
from ..utils.estado_limnigrafo import calcular_estado_limnigrafo
from ..serializer.medicionSerializer import normalizar_fecha_importacion, validar_datos_medicion

class MedicionPagination(PageNumberPagination):
    page_size = 50               
    page_size_query_param = 'limit' 
    max_page_size = 1000 

class MedicionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet
):
    queryset = Medicion.objects.all().order_by('-fecha_hora')
    serializer_class = MedicionSerializer
    pagination_class = MedicionPagination
    permission_classes = [MedicionesPermissionWithAPIKey] 
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MedicionFilter
    ordering_fields = ['fecha_hora', 'altura_agua', 'nivel_de_bateria']
    ordering = ['-fecha_hora']

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='serie')
    def serie(self, request):
        """
        Serie temporal agrupada, lista para graficar.

        El downsampling se hace acá y no en el navegador: 90 días de 10 sensores a
        una medición cada 5 minutos son ~260.000 filas, y la pantalla tiene 1.500
        píxeles de ancho. El cliente pide un techo de puntos (`max_puntos`) y el
        servidor elige el ancho de cubeta, informándolo en `bucket_segundos`.

        Query params: `limnigrafos` (IDs separados por coma), `atributo`,
        `fecha_inicio`, `fecha_fin` y `max_puntos`.
        """
        datos = self._validar_serie(request)
        atributo = datos['atributo']
        inicio, fin = datos['fecha_inicio'], datos['fecha_fin']

        codigos = self._codigos_de_limnigrafos(datos['limnigrafos'])

        base = (
            Medicion.objects
            .filter(limnigrafo_id__in=datos['limnigrafos'], fecha_hora__range=(inicio, fin))
            .exclude(**{f"{atributo}__isnull": True})
        )

        # Cuántas mediciones tiene el dispositivo más denso: es el que determina
        # hasta dónde se puede afinar la cubeta sin fabricar huecos vacíos.
        conteos = {
            fila['limnigrafo_id']: fila['n']
            for fila in base.values('limnigrafo_id').annotate(n=Count('id')).order_by()
        }
        maximo_registros = max(conteos.values(), default=0)
        sin_agrupar = not datos['agrupar_siempre'] and maximo_registros <= datos['max_puntos']

        por_dispositivo = {limnigrafo_id: {} for limnigrafo_id in datos['limnigrafos']}
        fecha_inicio_salida = inicio
        fecha_fin_salida = fin

        if sin_agrupar:
            # Si todas las mediciones entran en el límite no se necesita inventar
            # cubetas. La grilla es la unión de sus timestamps, por lo que las
            # series continúan alineadas al superponer dispositivos.
            instantes = set()
            mediciones = base.values('limnigrafo_id', 'fecha_hora', atributo).order_by('fecha_hora', 'id')
            for fila in mediciones:
                instante = fila['fecha_hora']
                instantes.add(instante)
                puntos = por_dispositivo[fila['limnigrafo_id']]
                anterior = puntos.get(instante)
                valor = fila[atributo]
                if anterior:
                    cantidad = anterior['total_registros'] + 1
                    puntos[instante] = {
                        'minimo': min(anterior['minimo'], valor),
                        'maximo': max(anterior['maximo'], valor),
                        'promedio': (anterior['promedio'] * anterior['total_registros'] + valor) / cantidad,
                        'total_registros': cantidad,
                    }
                    continue

                puntos[instante] = {
                    'minimo': valor,
                    'maximo': valor,
                    'promedio': valor,
                    'total_registros': 1,
                }

            grilla = sorted(instantes)
            bucket_segundos = 0
            if len(grilla) > 1:
                fecha_inicio_salida = grilla[0]
                fecha_fin_salida = grilla[-1]
        else:
            bucket = elegir_bucket(inicio, fin, datos['max_puntos'], maximo_registros)
            origen = origen_de_cubetas(inicio)
            grilla = generar_grilla(inicio, fin, bucket, origen)

            cubetas = (
                base
                .annotate(
                    cubeta=DateBin(
                        Value(bucket, output_field=DurationOutputField()),
                        F('fecha_hora'),
                        Value(origen, output_field=DateTimeOutputField()),
                    )
                )
                .values('limnigrafo_id', 'cubeta')
                .annotate(
                    minimo=Min(atributo),
                    maximo=Max(atributo),
                    promedio=Avg(atributo),
                    total_registros=Count('id'),
                )
                # `order_by()` vacío es obligatorio: el queryset del viewset ordena por
                # `-fecha_hora`, y Django suma las columnas de orden al GROUP BY, lo que
                # devolvería una fila por medición en lugar de una por cubeta.
                .order_by()
            )

            for fila in cubetas:
                por_dispositivo[fila['limnigrafo_id']][fila['cubeta']] = fila
            bucket_segundos = int(bucket.total_seconds())

        series = [
            {
                "limnigrafo": limnigrafo_id,
                "codigo": codigos[limnigrafo_id],
                "total_registros": conteos.get(limnigrafo_id, 0),
                "puntos": [
                    self._punto(inicio_cubeta, por_dispositivo[limnigrafo_id].get(inicio_cubeta))
                    for inicio_cubeta in grilla
                ],
            }
            for limnigrafo_id in datos['limnigrafos']
        ]

        salida = MedicionSerieOutputSerializer({
            "atributo": atributo,
            "fecha_inicio": fecha_inicio_salida,
            "fecha_fin": fecha_fin_salida,
            "bucket_segundos": bucket_segundos,
            "total_puntos": len(grilla),
            "series": series,
        })
        return Response(salida.data, status=status.HTTP_200_OK)

    @staticmethod
    def _punto(inicio_cubeta, agregados):
        """Una cubeta sin mediciones va con todo en `null` y `total_registros` en 0."""
        if agregados is None:
            return {
                "inicio": inicio_cubeta,
                "total_registros": 0,
                "minimo": None,
                "maximo": None,
                "promedio": None,
            }

        return {
            "inicio": inicio_cubeta,
            "total_registros": agregados['total_registros'],
            "minimo": agregados['minimo'],
            "maximo": agregados['maximo'],
            "promedio": agregados['promedio'],
        }

    def _validar_serie(self, request):
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

        max_puntos = request.query_params.get("max_puntos")
        if max_puntos is not None:
            payload["max_puntos"] = max_puntos

        agrupar_siempre = request.query_params.get("agrupar_siempre")
        if agrupar_siempre is not None:
            payload["agrupar_siempre"] = agrupar_siempre

        serializer = MedicionSerieInputSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    @staticmethod
    def _codigos_de_limnigrafos(ids):
        """Mapa `id -> codigo`. Un ID inexistente es un error del cliente."""
        codigos = dict(Limnigrafo.objects.filter(id__in=ids).values_list('id', 'codigo'))

        faltantes = [str(limnigrafo_id) for limnigrafo_id in ids if limnigrafo_id not in codigos]
        if faltantes:
            raise ValidationError({
                "limnigrafos": f"No existen los limnígrafos con ID: {', '.join(faltantes)}."
            })

        return codigos

    def perform_create(self, serializer):
        limnigrafo = serializer.validated_data["limnigrafo"]
        estado_anterior = limnigrafo.estado
        medicion_instance = serializer.save()
        limnigrafo = medicion_instance.limnigrafo
        
        # Actualizar batería actual solo si el sensor de batería funcionó
        # Si nivel_de_bateria es None (falla del sensor), mantener el último valor conocido
        if medicion_instance.nivel_de_bateria is not None:
            limnigrafo.bateria_actual = medicion_instance.nivel_de_bateria
        
        # Siempre actualizar última medición
        limnigrafo.ultima_medicion = medicion_instance
        
        # Calcular estado operativo actual
        nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
        limnigrafo.estado = nuevo_estado
        
        from ..utils.estado_limnigrafo import calcular_estado_medicion_limnigrafo
        limnigrafo.estado_medicion = calcular_estado_medicion_limnigrafo(limnigrafo)
        
        limnigrafo.save(update_fields=['bateria_actual', 'ultima_medicion', 'estado', 'estado_medicion'])
        generar_alerta_medicion_fuera_de_rango(medicion_instance)

        if medicion_instance.fuente == "manual":
            registrar_accion_auditoria_en_commit(
                request=self.request,
                tipo_accion="manual_data_load",
                entidad="Medición",
                entidad_id=medicion_instance.id,
                descripcion=f"Cargó manualmente datos para el limnígrafo '{limnigrafo.codigo}'.",
                metadata={
                    "limnigrafo_id": limnigrafo.id,
                    "limnigrafo_codigo": limnigrafo.codigo,
                    "medicion_id": medicion_instance.id,
                    "fecha_hora_medicion": medicion_instance.fecha_hora.isoformat(),
                },
            )

    def _build_row_issue(self, *, field, code, message):
        return {
            "field": field,
            "code": code,
            "message": message,
        }

    def _build_validation_response(self, rows, file_name, fuente):
        valid_rows = sum(1 for row in rows if row["status"] == "valid")
        error_rows = sum(1 for row in rows if row["status"] != "valid")
        return {
            "file_name": file_name,
            "fuente": fuente,
            "is_valid": error_rows == 0,
            "summary": {
                "total_rows": len(rows),
                "valid_rows": valid_rows,
                "error_rows": error_rows,
            },
            "rows": rows,
        }

    def _validar_lote_importacion(self, payload):
        fallback_limnigrafo_id = payload.get("fallback_limnigrafo_id")
        raw_rows = payload.get("rows", [])
        
        validated_rows = []
        issues_by_row = {}
        
        for idx, raw_row in enumerate(raw_rows):
            row_number = raw_row.get("row_number")
            if row_number is None or not isinstance(row_number, int):
                row_number = idx + 1
            
            issues_by_row[row_number] = []
            
            row_serializer = MedicionImportRowSerializer(data=raw_row)
            if not row_serializer.is_valid():
                for field, messages in row_serializer.errors.items():
                    for msg in (messages if isinstance(messages, list) else [messages]):
                        issues_by_row[row_number].append(
                            self._build_row_issue(
                                field=field,
                                code="invalid",
                                message=str(msg)
                            )
                        )
                continue
                
            validated_rows.append(row_serializer.validated_data)
            
        limnigrafo_ids = set()
        limnigrafo_codigos = set()
        for row in validated_rows:
            l_id = row.get("limnigrafo_id")
            if l_id is not None:
                limnigrafo_ids.add(l_id)
            l_cod = row.get("limnigrafo")
            if l_cod:
                limnigrafo_codigos.add(l_cod)
                
        if fallback_limnigrafo_id is not None:
            limnigrafo_ids.add(fallback_limnigrafo_id)
            
        limnigrafos_by_id = {
            lim.id: lim
            for lim in Limnigrafo.objects.filter(id__in=limnigrafo_ids).prefetch_related("configuraciones")
        }
        limnigrafos_by_codigo = {
            lim.codigo: lim
            for lim in Limnigrafo.objects.filter(codigo__in=limnigrafo_codigos).prefetch_related("configuraciones")
        }
        
        normalized_rows = []
        seen_keys = Counter()
        seen_idempotency = Counter()
        
        for row in validated_rows:
            row_number = row["row_number"]
            resolved_limnigrafo = None
            
            l_id = row.get("limnigrafo_id")
            l_cod = row.get("limnigrafo")
            
            if l_id is not None:
                resolved_limnigrafo = limnigrafos_by_id.get(l_id)
            elif l_cod:
                resolved_limnigrafo = limnigrafos_by_codigo.get(l_cod)
                
            if resolved_limnigrafo is None and fallback_limnigrafo_id is not None:
                resolved_limnigrafo = limnigrafos_by_id.get(fallback_limnigrafo_id)
                
            if resolved_limnigrafo is None:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="limnigrafo_id",
                        code="required",
                        message="La fila no tiene limnígrafo y tampoco se definió uno por defecto.",
                    )
                )
            
            fecha_hora = None
            raw_fecha_hora = row.get("fecha_hora")
            if not raw_fecha_hora:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="fecha_hora",
                        code="required",
                        message="La fecha y hora es obligatoria para importar mediciones.",
                    )
                )
            else:
                try:
                    fecha_hora = normalizar_fecha_importacion(raw_fecha_hora)
                except Exception:
                    issues_by_row[row_number].append(
                        self._build_row_issue(
                            field="fecha_hora",
                            code="invalid",
                            message="La fecha y hora no tiene un formato válido.",
                        )
                    )
                    
            altura_agua = row.get("altura_agua")
            if altura_agua is None:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="altura_agua",
                        code="required",
                        message="La altura del agua es obligatoria.",
                    )
                )
                
            attrs = {
                "limnigrafo": resolved_limnigrafo,
                "fecha_hora": fecha_hora,
                "altura_agua": altura_agua,
                "presion": row.get("presion"),
                "temperatura": row.get("temperatura"),
                "nivel_de_bateria": row.get("nivel_de_bateria"),
                "idempotency_key": row.get("idempotency_key"),
            }
            
            if resolved_limnigrafo is not None and fecha_hora is not None:
                try:
                    validar_datos_medicion(attrs, check_duplicates=False)
                except Exception as exc:
                    detail = getattr(exc, "detail", {})
                    for field, messages in detail.items():
                        for message in (messages if isinstance(messages, list) else [messages]):
                            issues_by_row[row_number].append(
                                self._build_row_issue(
                                    field=field,
                                    code="invalid",
                                    message=str(message),
                                )
                            )
                            
            duplicate_key = None
            if resolved_limnigrafo is not None and fecha_hora is not None:
                duplicate_key = (resolved_limnigrafo.id, fecha_hora.isoformat())
                seen_keys[duplicate_key] += 1
                
            dup_idempotency_key = None
            idempotency_key = row.get("idempotency_key")
            if resolved_limnigrafo is not None and idempotency_key:
                dup_idempotency_key = (resolved_limnigrafo.id, idempotency_key.strip())
                seen_idempotency[dup_idempotency_key] += 1
                
            fuente_fila = row.get("fuente") or payload.get("fuente")
            
            normalized_rows.append(
                {
                    "row_number": row_number,
                    "limnigrafo_id": resolved_limnigrafo.id if resolved_limnigrafo else None,
                    "fecha_hora": fecha_hora,
                    "altura_agua": altura_agua,
                    "presion": row.get("presion"),
                    "temperatura": row.get("temperatura"),
                    "nivel_de_bateria": row.get("nivel_de_bateria"),
                    "idempotency_key": idempotency_key,
                    "fuente": fuente_fila,
                    "duplicate_key": duplicate_key,
                    "dup_idempotency_key": dup_idempotency_key,
                }
            )
            
        for normalized_row in normalized_rows:
            row_number = normalized_row["row_number"]
            
            dk = normalized_row["duplicate_key"]
            if dk and seen_keys[dk] > 1:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="fecha_hora",
                        code="duplicate_file",
                        message="Ya existe otra fila en el archivo con el mismo limnígrafo y fecha/hora.",
                    )
                )
                
            dik = normalized_row["dup_idempotency_key"]
            if dik and seen_idempotency[dik] > 1:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="idempotency_key",
                        code="duplicate_file",
                        message="Ya existe otra fila en el archivo con el mismo limnígrafo y clave de idempotencia.",
                    )
                )
                
        db_duplicate_keys = set()
        db_duplicate_idempotency_keys = set()
        
        if normalized_rows:
            duplicate_query = Q()
            idempotency_query = Q()
            
            for normalized_row in normalized_rows:
                lim_id = normalized_row["limnigrafo_id"]
                if lim_id is None:
                    continue
                
                if normalized_row["fecha_hora"] is not None:
                    duplicate_query |= Q(
                        limnigrafo_id=lim_id,
                        fecha_hora=normalized_row["fecha_hora"],
                    )
                
                ik = normalized_row["idempotency_key"]
                if ik:
                    idempotency_query |= Q(
                        limnigrafo_id=lim_id,
                        idempotency_key=ik.strip(),
                    )
                    
            if duplicate_query:
                db_duplicate_keys = {
                    (medicion.limnigrafo_id, medicion.fecha_hora.isoformat())
                    for medicion in Medicion.objects.filter(duplicate_query)
                }
                
            if idempotency_query:
                db_duplicate_idempotency_keys = {
                    (medicion.limnigrafo_id, medicion.idempotency_key)
                    for medicion in Medicion.objects.filter(idempotency_query)
                }
                
        response_rows = []
        limnigrafos_afectados = {**limnigrafos_by_id, **{lim.id: lim for lim in limnigrafos_by_codigo.values()}}
        
        all_row_numbers = sorted(list(issues_by_row.keys()))
        valid_rows_map = {row["row_number"]: row for row in normalized_rows}
        
        for r_num in all_row_numbers:
            row_issues = list(issues_by_row[r_num])
            norm_row = valid_rows_map.get(r_num)
            
            if norm_row:
                dk = norm_row["duplicate_key"]
                if dk and dk in db_duplicate_keys:
                    row_issues.append(
                        self._build_row_issue(
                            field="fecha_hora",
                            code="duplicate_database",
                            message="Ya existe una medición guardada con el mismo limnígrafo y fecha/hora.",
                        )
                    )
                    
                dik = norm_row["dup_idempotency_key"]
                if dik and dik in db_duplicate_idempotency_keys:
                    row_issues.append(
                        self._build_row_issue(
                            field="idempotency_key",
                            code="duplicate_database",
                            message="Ya existe una medición guardada con el mismo limnígrafo y clave de idempotencia.",
                        )
                    )
                    
            status_value = "valid"
            issue_codes = {issue["code"] for issue in row_issues}
            if "duplicate_database" in issue_codes:
                status_value = "duplicate_database"
            elif "duplicate_file" in issue_codes:
                status_value = "duplicate_file"
            elif row_issues:
                status_value = "error"
                
            response_rows.append(
                {
                    "rowNumber": r_num,
                    "limnigrafoId": norm_row["limnigrafo_id"] if norm_row else None,
                    "fechaHora": norm_row["fecha_hora"].isoformat() if norm_row and norm_row["fecha_hora"] else "",
                    "alturaAgua": norm_row["altura_agua"] if norm_row else raw_rows[r_num - 1].get("altura_agua"),
                    "presion": norm_row["presion"] if norm_row else raw_rows[r_num - 1].get("presion"),
                    "temperatura": norm_row["temperatura"] if norm_row else raw_rows[r_num - 1].get("temperatura"),
                    "nivelBateria": norm_row["nivel_de_bateria"] if norm_row else raw_rows[r_num - 1].get("nivel_de_bateria"),
                    "idempotencyKey": norm_row["idempotency_key"] if norm_row else None,
                    "fuente": norm_row["fuente"] if norm_row else None,
                    "status": status_value,
                    "issues": row_issues,
                }
            )
            
        return response_rows, limnigrafos_afectados

    @action(detail=False, methods=["post"], url_path="validate-import")
    def validate_import(self, request):
        serializer = MedicionImportPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rows, _ = self._validar_lote_importacion(serializer.validated_data)
        return Response(
            self._build_validation_response(
                rows,
                serializer.validated_data["file_name"],
                serializer.validated_data["fuente"],
            ),
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="bulk-import")
    def bulk_import(self, request):
        serializer = MedicionImportPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_payload = serializer.validated_data
        rows, limnigrafos = self._validar_lote_importacion(validated_payload)
        response_payload = self._build_validation_response(
            rows,
            validated_payload["file_name"],
            validated_payload["fuente"],
        )
        if not response_payload["is_valid"]:
            return Response(response_payload, status=status.HTTP_400_BAD_REQUEST)

        rows_to_create = []
        limnigrafo_ids_afectados = set()
        for row in rows:
            limnigrafo_id = row["limnigrafoId"]
            limnigrafo = limnigrafos[limnigrafo_id]
            fuente_medicion = row.get("fuente") or validated_payload["fuente"]
            rows_to_create.append(
                Medicion(
                    limnigrafo=limnigrafo,
                    fecha_hora=normalizar_fecha_importacion(row["fechaHora"]),
                    altura_agua=row["alturaAgua"],
                    presion=row["presion"],
                    temperatura=row["temperatura"],
                    nivel_de_bateria=row["nivelBateria"],
                    idempotency_key=row.get("idempotencyKey"),
                    fuente=fuente_medicion,
                )
            )
            limnigrafo_ids_afectados.add(limnigrafo_id)

        limnigrafos_afectados = {
            limnigrafo.id: limnigrafo
            for limnigrafo in Limnigrafo.objects.filter(id__in=limnigrafo_ids_afectados).prefetch_related("configuraciones")
        }
        estado_anterior_por_limnigrafo = {
            limnigrafo.id: limnigrafo.estado
            for limnigrafo in limnigrafos_afectados.values()
        }

        with transaction.atomic():
            mediciones_creadas = Medicion.objects.bulk_create(rows_to_create)

            mediciones_por_limnigrafo = {}
            for medicion in mediciones_creadas:
                mediciones_por_limnigrafo.setdefault(medicion.limnigrafo_id, []).append(medicion)
                generar_alerta_medicion_fuera_de_rango(medicion)

            for limnigrafo_id, mediciones in mediciones_por_limnigrafo.items():
                limnigrafo = limnigrafos_afectados[limnigrafo_id]
                mediciones_ordenadas = sorted(mediciones, key=lambda item: item.fecha_hora)
                ultima_medicion = mediciones_ordenadas[-1]
                ultima_con_bateria = next(
                    (medicion for medicion in reversed(mediciones_ordenadas) if medicion.nivel_de_bateria is not None),
                    None,
                )

                if ultima_con_bateria is not None:
                    limnigrafo.bateria_actual = ultima_con_bateria.nivel_de_bateria
                limnigrafo.ultima_medicion = ultima_medicion
                nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
                limnigrafo.estado = nuevo_estado
                from ..utils.estado_limnigrafo import calcular_estado_medicion_limnigrafo
                limnigrafo.estado_medicion = calcular_estado_medicion_limnigrafo(limnigrafo)
                limnigrafo.save(update_fields=['bateria_actual', 'ultima_medicion', 'estado', 'estado_medicion'])

            distribucion = [
                {
                    "limnigrafo_id": limnigrafo_id,
                    "limnigrafo_codigo": limnigrafos_afectados[limnigrafo_id].codigo,
                    "filas_cargadas": len(mediciones),
                }
                for limnigrafo_id, mediciones in sorted(mediciones_por_limnigrafo.items())
            ]
            registrar_accion_auditoria_en_commit(
                request=request,
                tipo_accion="import_data_load",
                entidad="Medición",
                entidad_id=len(mediciones_creadas),
                descripcion=f"Importó {len(mediciones_creadas)} mediciones desde '{validated_payload['file_name']}'.",
                metadata={
                    "file_name": validated_payload["file_name"],
                    "fuente": validated_payload["fuente"],
                    "filas_cargadas": len(mediciones_creadas),
                    "filas_rechazadas": 0,
                    "limnigrafos": distribucion,
                },
            )

        return Response(
            {
                "message": "Importación completada correctamente.",
                "imported_rows": len(rows_to_create),
                "rows": rows,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request):
        data = request.data
        if isinstance(data, dict) and "mediciones" in data:
            data = data["mediciones"]
            
        if not isinstance(data, list):
            return Response(
                {"detail": "El payload debe ser una lista de mediciones o un objeto con la clave 'mediciones'."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = MedicionSerializer(data=data, many=True, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            mediciones = serializer.save()
            
            # Agrupar las mediciones por limnígrafo para actualizar el estado final correctamente
            mediciones_por_limnigrafo = {}
            estado_anterior_por_limnigrafo = {}
            for m in mediciones:
                lim_id = m.limnigrafo.id
                if lim_id not in mediciones_por_limnigrafo:
                    mediciones_por_limnigrafo[lim_id] = []
                    estado_anterior_por_limnigrafo[lim_id] = m.limnigrafo.estado
                mediciones_por_limnigrafo[lim_id].append(m)
                
            for lim_id, meds in mediciones_por_limnigrafo.items():
                limnigrafo = meds[0].limnigrafo
                meds_ordenadas = sorted(meds, key=lambda item: item.fecha_hora)
                ultima_medicion = meds_ordenadas[-1]
                
                # Actualizar la batería si alguna de las mediciones del lote trajo nivel de batería
                ultima_con_bateria = next(
                    (m for m in reversed(meds_ordenadas) if m.nivel_de_bateria is not None),
                    None
                )
                if ultima_con_bateria is not None:
                    limnigrafo.bateria_actual = ultima_con_bateria.nivel_de_bateria
                    
                limnigrafo.ultima_medicion = ultima_medicion
                nuevo_estado = calcular_estado_limnigrafo(limnigrafo)
                limnigrafo.estado = nuevo_estado
                from ..utils.estado_limnigrafo import calcular_estado_medicion_limnigrafo
                limnigrafo.estado_medicion = calcular_estado_medicion_limnigrafo(limnigrafo)
                limnigrafo.save(update_fields=['bateria_actual', 'ultima_medicion', 'estado', 'estado_medicion'])
                
                # Generar alertas de fuera de rango para las mediciones individuales
                for m in meds:
                    generar_alerta_medicion_fuera_de_rango(m)
                    
            # Registrar en auditoría si se cargaron de forma manual
            manual_meds = [m for m in mediciones if m.fuente == "manual"]
            if manual_meds:
                codigos = ", ".join(set(m.limnigrafo.codigo for m in manual_meds))
                registrar_accion_auditoria_en_commit(
                    request=self.request,
                    tipo_accion="manual_data_load",
                    entidad="Medición",
                    entidad_id=manual_meds[0].id,
                    descripcion=f"Cargó manualmente un lote de {len(manual_meds)} mediciones para los limnígrafos: {codigos}.",
                    metadata={
                        "cantidad": len(manual_meds),
                        "codigos_limnigrafos": list(set(m.limnigrafo.codigo for m in manual_meds)),
                    },
                )
                
        return Response(
            {"detail": f"Se procesaron y crearon {len(mediciones)} mediciones con éxito."},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=["post"], url_path="import-summary")
    def import_summary(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "No autorizado."}, status=status.HTTP_401_UNAUTHORIZED)

        file_name = request.data.get("file_name")
        limnigrafo_id = request.data.get("limnigrafo_id")
        loaded_rows = request.data.get("loaded_rows")
        rejected_rows = request.data.get("rejected_rows")
        fuente = request.data.get("fuente")

        if not file_name or not isinstance(file_name, str):
            return Response({"error": "El campo 'file_name' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        if limnigrafo_id in (None, ""):
            return Response({"error": "El campo 'limnigrafo_id' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            limnigrafo_id = int(limnigrafo_id)
            loaded_rows = int(loaded_rows)
            rejected_rows = int(rejected_rows)
        except (TypeError, ValueError):
            return Response(
                {"error": "Los campos 'limnigrafo_id', 'loaded_rows' y 'rejected_rows' deben ser numéricos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if loaded_rows < 0 or rejected_rows < 0:
            return Response(
                {"error": "Los campos 'loaded_rows' y 'rejected_rows' no pueden ser negativos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        limnigrafo = Limnigrafo.objects.filter(id=limnigrafo_id).first()
        if limnigrafo is None:
            return Response({"error": "Limnígrafo no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        descripcion = (
            f"Importó {loaded_rows} mediciones desde '{file_name}' para el limnígrafo '{limnigrafo.codigo}'."
        )
        registrar_accion_auditoria_en_commit(
            request=request,
            tipo_accion="import_data_load",
            entidad="Medición",
            entidad_id=limnigrafo.id,
            descripcion=descripcion,
            metadata={
                "file_name": file_name,
                "fuente": fuente,
                "limnigrafo_id": limnigrafo.id,
                "limnigrafo_codigo": limnigrafo.codigo,
                "filas_cargadas": loaded_rows,
                "filas_rechazadas": rejected_rows,
            },
        )

        return Response(
            {
                "message": "Resumen de importación registrado correctamente.",
            },
            status=status.HTTP_201_CREATED,
        )
