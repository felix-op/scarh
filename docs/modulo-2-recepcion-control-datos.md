# Módulo 2: Recepción y Control de los Datos

Este módulo gestiona la recolección, validación y persistencia de las mediciones emitidas por los dispositivos o ingresadas manualmente.

### RF [2.01] Recepción de información por Internet
* **Usuarios**: El limnígrafo, el sistema.
* **Descripción**: El sistema recibe de manera continua los datos enviados por cada limnígrafo a través de internet, sin necesidad de conexiones físicas.

### RF [2.02] Recepción de información por Sistema
* **Usuarios**: Administrador, usuarios.
* **Descripción**: El sistema también puede recibir los datos cargados por el usuario.

### RF [2.03] Validación de datos recibidos
* **Usuarios**: El sistema, el limnígrafo.
* **Descripción**: Los datos que lleguen deben revisarse para evitar duplicados, errores o valores fuera de lo normal.

### RF [2.04] Notificación de datos anómalos
* **Usuarios**: El sistema, el limnígrafo.
* **Descripción**: Cuando el sistema detecta datos válidos estructuralmente pero que están fuera de los valores esperados o seguros, debe generar una alerta visual o notificación al usuario para su revisión. Ej: valores extremadamente altos o bajos en niveles de agua.

### RF [2.05] Información de últimos envíos
* **Usuarios**: El sistema, el limnígrafo.
* **Descripción**: El sistema muestra un listado de los limnígrafos con la fecha de su última transmisión y un indicador de color (verde, amarillo o rojo) según el tiempo transcurrido desde su última respuesta.

### RF [2.06] Base de datos centralizada
* **Usuarios**: El sistema, el limnígrafo.
* **Descripción**: Todos los datos recibidos deben almacenarse en una única base de datos central, organizada y segura, para garantizar la integridad y disponibilidad de los registros para futuras consultas y análisis.

### RF [2.07] Importación de datos
* **Usuarios**: Administrador, usuarios.
* **Descripción**: Permitir a los usuarios ingresar un archivo CSV para poder cargar datos de manera manual.
