from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        response = Response(status=500)

    data = {}
    
    data['codigo'] = response.status_code
    
    data['titulo'] = response.status_text

    if isinstance(response.data, dict):
        if 'detail' in response.data:
            data['descripcion_tecnica'] = response.data['detail']
        else:
            data['descripcion_tecnica'] = str(response.data)
    elif isinstance(response.data, list):
        data['descripcion_tecnica'] = ", ".join(response.data)
    else:
        data['descripcion_tecnica'] = str(response.data)


    if data['codigo'] == 404:
        data['descripcion_usuario'] = "El recurso solicitado no se ha encontrado."
    elif data['codigo'] == 400:
        data['descripcion_usuario'] = "Por favor, revisa los datos enviados. Hay campos incorrectos o faltantes."
    elif data['codigo'] == 401:
        data['descripcion_usuario'] = "No estás autenticado. Por favor, inicia sesión."
from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        response = Response(status=500)

    data = {}
    
    data['codigo'] = response.status_code
    
    data['titulo'] = response.status_text

    if isinstance(response.data, dict):
        if 'detail' in response.data:
            data['descripcion_tecnica'] = response.data['detail']
        else:
            data['descripcion_tecnica'] = str(response.data)
    elif isinstance(response.data, list):
        data['descripcion_tecnica'] = ", ".join(response.data)
    else:
        data['descripcion_tecnica'] = str(response.data)


    if data['codigo'] == 404:
        data['descripcion_usuario'] = "El recurso solicitado no se ha encontrado."
    elif data['codigo'] == 400:
        data['descripcion_usuario'] = "Por favor, revisa los datos enviados. Hay campos incorrectos o faltantes."
    elif data['codigo'] == 401:
        data['descripcion_usuario'] = "No estás autenticado. Por favor, inicia sesión."
    elif data['codigo'] == 403:
        data['descripcion_usuario'] = "No tienes permiso para realizar esta acción."
    elif data['codigo'] >= 500:
        data['titulo'] = "Error Interno del Servidor"
        data['descripcion_usuario'] = "Ha ocurrido un error inesperado en nuestros sistemas. Nuestro equipo ha sido notificado."
        # Opcional: en modo DEBUG, muestra el error real
        from django.conf import settings
        if settings.DEBUG:
           data['descripcion_tecnica'] = str(exc)
    else:
        data['descripcion_usuario'] = "Ha ocurrido un error."


    response.data = data
    
    return response