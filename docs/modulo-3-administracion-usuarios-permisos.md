# Módulo 3: Administración de Usuarios y Permisos

Este módulo centraliza la gestión de cuentas de usuario, sus roles y la trazabilidad de sus acciones dentro de la plataforma.

### RF [3.01] Edición de perfil
* **Usuarios**: Administrador.
* **Descripción**: Cada administrador es capaz de modificar los datos personales de los usuarios.

### RF [3.02] Inicio de sesión
* **Usuarios**: Administrador, usuarios.
* **Descripción**: Cada usuario accede al sistema ingresando su nombre de usuario y la contraseña asignada por el administrador.

### RF [3.03] Cambiar contraseña
* **Usuarios**: Administrador.
* **Descripción**: El administrador puede cambiar las contraseñas de los usuarios.

### RF [3.04] Borrar cuentas
* **Usuarios**: Administrador.
* **Descripción**: Permitir al administrador eliminar cuentas de usuarios o deshabilitar su ingreso.

### RF [3.05] Otorgar permisos
* **Usuarios**: Administrador.
* **Descripción**: Se debe permitir al administrador modificar permisos para acceder a los diferentes módulos.

### RF [3.06] Generación de token
* **Usuarios**: Administrador, usuarios.
* **Descripción**: El sistema debe permitir la generación de tokens de acceso para interactuar de forma segura con la API. Estos tokens se utilizarán tanto para:
  * La transmisión de datos por parte de los limnígrafos.
  * El acceso a los datos por parte de aplicaciones o páginas web cliente autorizadas.

### RF [3.07] Creación de cuentas
* **Usuarios**: Administrador.
* **Descripción**: El administrador es el único que tiene el permiso para crear cuentas de usuarios.

### RF [3.08] Historial de acciones
* **Usuario**: Administrador, usuarios.
* **Descripción**: Se mantiene un registro de todas las acciones que modifiquen la base de datos que realiza cada usuario.
