from collections import Counter

from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Medicion, Limnigrafo
from ..serializer import MedicionImportPayloadSerializer, MedicionSerializer
from ..permissions import MedicionesPermissionWithAPIKey
from ..filters import MedicionFilter
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
        rows = payload["rows"]
        issues_by_row = {row["row_number"]: [] for row in rows}
        normalized_rows = []

        limnigrafo_ids = {
            row.get("limnigrafo_id")
            for row in rows
            if row.get("limnigrafo_id") is not None
        }
        if fallback_limnigrafo_id is not None:
            limnigrafo_ids.add(fallback_limnigrafo_id)

        limnigrafos = {
            limnigrafo.id: limnigrafo
            for limnigrafo in Limnigrafo.objects.filter(id__in=limnigrafo_ids).prefetch_related("configuraciones")
        }

        seen_keys = Counter()
        seen_row_numbers_by_key = {}

        for row in rows:
            row_number = row["row_number"]
            limnigrafo_id = row.get("limnigrafo_id")
            resolved_limnigrafo_id = limnigrafo_id if limnigrafo_id is not None else fallback_limnigrafo_id
            fecha_hora = None

            if resolved_limnigrafo_id is None:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="limnigrafo_id",
                        code="required",
                        message="La fila no tiene limnígrafo y tampoco se definió uno por defecto.",
                    )
                )
            elif resolved_limnigrafo_id not in limnigrafos:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="limnigrafo_id",
                        code="not_found",
                        message=f"No existe el limnígrafo con ID {resolved_limnigrafo_id}.",
                    )
                )

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

            attrs = {
                "limnigrafo": limnigrafos.get(resolved_limnigrafo_id),
                "fecha_hora": fecha_hora,
                "altura_agua": row.get("altura_agua"),
                "presion": row.get("presion"),
                "temperatura": row.get("temperatura"),
                "nivel_de_bateria": row.get("nivel_de_bateria"),
                "idempotency_key": None,
            }

            if attrs["altura_agua"] is None:
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="altura_agua",
                        code="required",
                        message="La altura del agua es obligatoria.",
                    )
                )
            else:
                try:
                    validar_datos_medicion(attrs, check_duplicates=False)
                except Exception as exc:
                    detail = getattr(exc, "detail", {})
                    for field, messages in detail.items():
                        if not isinstance(messages, list):
                            messages = [messages]
                        for message in messages:
                            issues_by_row[row_number].append(
                                self._build_row_issue(
                                    field=field,
                                    code="invalid",
                                    message=str(message),
                                )
                            )

            duplicate_key = None
            if resolved_limnigrafo_id is not None and fecha_hora is not None:
                duplicate_key = (resolved_limnigrafo_id, fecha_hora.isoformat())
                seen_keys[duplicate_key] += 1
                seen_row_numbers_by_key.setdefault(duplicate_key, []).append(row_number)

            normalized_rows.append(
                {
                    "row_number": row_number,
                    "limnigrafo_id": resolved_limnigrafo_id,
                    "fecha_hora": fecha_hora,
                    "altura_agua": row.get("altura_agua"),
                    "presion": row.get("presion"),
                    "temperatura": row.get("temperatura"),
                    "nivel_de_bateria": row.get("nivel_de_bateria"),
                    "duplicate_key": duplicate_key,
                }
            )

        duplicate_keys = {key for key, count in seen_keys.items() if count > 1}
        for normalized_row in normalized_rows:
            duplicate_key = normalized_row["duplicate_key"]
            if duplicate_key and duplicate_key in duplicate_keys:
                row_number = normalized_row["row_number"]
                issues_by_row[row_number].append(
                    self._build_row_issue(
                        field="fecha_hora",
                        code="duplicate_file",
                        message="Ya existe otra fila en el archivo con el mismo limnígrafo y fecha/hora.",
                    )
                )

        db_duplicate_keys = set()
        if normalized_rows:
            duplicate_query = Q()
            for normalized_row in normalized_rows:
                duplicate_key = normalized_row["duplicate_key"]
                if duplicate_key is None:
                    continue
                duplicate_query |= Q(
                    limnigrafo_id=duplicate_key[0],
                    fecha_hora=normalized_row["fecha_hora"],
                )

            if duplicate_query:
                db_duplicate_keys = {
                    (medicion.limnigrafo_id, medicion.fecha_hora.isoformat())
                    for medicion in Medicion.objects.filter(duplicate_query)
                }

        response_rows = []
        for normalized_row in normalized_rows:
            row_number = normalized_row["row_number"]
            duplicate_key = normalized_row["duplicate_key"]
            row_issues = list(issues_by_row[row_number])

            if duplicate_key and duplicate_key in db_duplicate_keys:
                row_issues.append(
                    self._build_row_issue(
                        field="fecha_hora",
                        code="duplicate_database",
                        message="Ya existe una medición guardada con el mismo limnígrafo y fecha/hora.",
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
                    "rowNumber": row_number,
                    "limnigrafoId": normalized_row["limnigrafo_id"],
                    "fechaHora": normalized_row["fecha_hora"].isoformat() if normalized_row["fecha_hora"] else "",
                    "alturaAgua": normalized_row["altura_agua"],
                    "presion": normalized_row["presion"],
                    "temperatura": normalized_row["temperatura"],
                    "nivelBateria": normalized_row["nivel_de_bateria"],
                    "status": status_value,
                    "issues": row_issues,
                }
            )

        return response_rows, limnigrafos

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
            rows_to_create.append(
                Medicion(
                    limnigrafo=limnigrafo,
                    fecha_hora=normalizar_fecha_importacion(row["fechaHora"]),
                    altura_agua=row["alturaAgua"],
                    presion=row["presion"],
                    temperatura=row["temperatura"],
                    nivel_de_bateria=row["nivelBateria"],
                    fuente=validated_payload["fuente"],
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
