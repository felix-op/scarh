from django.db import IntegrityError
from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.conf import settings
from rest_framework.exceptions import ParseError
import datetime, traceback, logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is None:
        response = Response(status=500)

    data = {}
    data['codigo'] = response.status_code
    data['titulo'] = response.reason_phrase

    if isinstance(exc, ParseError):
        data['descripcion_tecnica'] = f"Error de formato JSON: {str(exc)}"
        data['descripcion_usuario'] = "Hay un valor con formato incorrecto. Verifique que los números y fechas sean válidos."
    elif isinstance(exc, IntegrityError):
        error_msg = str(exc).lower()
        if 'unique' in error_msg or 'duplicate' in error_msg:
            response.status_code = 409
            data['codigo'] = 409
            data['titulo'] = "Conflict"
            data['descripcion_tecnica'] = f"Error de dato unico: {str(exc)}"
            
            mensajes_especificos = []
            if hasattr(response, 'data') and isinstance(response.data, dict):
                for campo, errores in response.data.items():
                    nombre_campo = "General" if campo == "non_field_errors" else campo
                    mensaje = errores[0] if isinstance(errores, list) and errores else errores
                    mensajes_especificos.append(f"{nombre_campo}: {mensaje}")
            
            if not mensajes_especificos:
                import re
                
                campos_conocidos = {
                    'username': 'nombre_usuario',
                    'email': 'email',
                    'legajo': 'legajo'
                }
                
                campo_encontrado = None
                match = re.search(r'unique constraint failed: \w+\.(\w+)|duplicate key value violates unique constraint.*\n.*key \((\w+)\)=|key \'(\w+)\'', error_msg)
                
                if match:
                    campo_encontrado = next((g for g in match.groups() if g), None)
                if not campo_encontrado:
                    for db_field in campos_conocidos.keys():
                        if db_field in error_msg:
                            campo_encontrado = db_field
                            break
                            
                if campo_encontrado:
                    nombre_amigable = campos_conocidos.get(campo_encontrado, campo_encontrado)
                    mensajes_especificos.append(f"{nombre_amigable}: Ya existe un registro con este dato.")
            
            if mensajes_especificos:
                data['descripcion_usuario'] = " ".join(mensajes_especificos)
            else:
                data['descripcion_usuario'] = "Ya existe un registro con estos datos. No se permiten elementos duplicados."
        else:
            response.status_code = 400
            data['codigo'] = 400
            data['titulo'] = "Bad Request"
            data['descripcion_tecnica'] = f"Error de integridad: {str(exc)}"
            data['descripcion_usuario'] = "No se pudo procesar la solicitud por un error en los datos."
    elif isinstance(response.data, dict):
        if 'detail' in response.data:
            data['descripcion_tecnica'] = response.data['detail']
        else:
            mensajes_especificos = []
            for campo, errores in response.data.items():
                nombre_campo = "General" if campo == "non_field_errors" else campo
                mensaje = errores[0] if isinstance(errores, list) and errores else errores
                mensajes_especificos.append(f"{nombre_campo}: {mensaje}")
                
            data['descripcion_usuario'] = " ".join(mensajes_especificos) if mensajes_especificos else "Por favor, revisa los datos enviados."
            data['descripcion_tecnica'] = "Faltan o son incorrectos los campos: " + ", ".join(mensajes_especificos) if mensajes_especificos else "Cuerpo de la solicitud vacío o con estructura inválida."
    
    elif isinstance(response.data, list):
        data['descripcion_tecnica'] = ", ".join([str(e) for e in response.data])
    else:
        data['descripcion_tecnica'] = str(response.data)

    mapeo_mensajes = {
        404: "El recurso solicitado no se ha encontrado.",
        400: "Por favor, revisa los datos enviados. Hay campos incorrectos o faltantes.",
        401: "No estás autenticado. Por favor, inicia sesión.",
        403: "No tienes permiso para realizar esta acción.",
    }

    if 'descripcion_usuario' not in data:
        data['descripcion_usuario'] = mapeo_mensajes.get(data['codigo'], "Ha ocurrido un error.")

    if data['codigo'] >= 500:
        data['titulo'] = "Error Interno del Servidor"
        data['descripcion_usuario'] = "Ha ocurrido un error inesperado en nuestros sistemas."
        if settings.DEBUG:
            data['descripcion_tecnica'] = str(exc)


    log_message = f"custom_exception_handler\n"
    log_message += f"Status Code: {data['codigo']} {data['titulo']}\n"
    log_message += f"Endpoint: {context['request'].path}\n"
    log_message += f"Method: {context['request'].method}\n"
    log_message += f"Technical Message: {data['descripcion_tecnica']}\n"
    
    try:
        log_message += f"Payload Received: {context['request'].data}\n"
    except Exception:
        log_message += "Payload Received: (Error leyendo payload)\n"

    if data['codigo'] >= 500:
        log_message += f"Traceback:\n{traceback.format_exc()}"
        logger.error(log_message)
    else:
        logger.warning(log_message)
    response.data = data
    return response