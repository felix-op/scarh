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
    
    elif isinstance(response.data, dict):
        if 'detail' in response.data:
            data['descripcion_tecnica'] = response.data['detail']
        else:
            mensajes_especificos = []
            for campo, errores in response.data.items():
                nombre_campo = "General" if campo == "non_field_errors" else campo
                mensaje = errores[0] if isinstance(errores, list) else errores
                mensajes_especificos.append(f"{nombre_campo}: {mensaje}")
            
            data['descripcion_tecnica'] = "Faltan o son incorrectos los campos: " + ", ".join(mensajes_especificos)
    
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