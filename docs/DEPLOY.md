# SCARH - Guía de desarrollo local y despliegue

## Introducción

Este documento describe el flujo para trabajar con SCARH en desarrollo local y realizar despliegues de los distintos componentes del sistema.

Las instrucciones de despliegue están destinadas principalmente a **Felix**, ya que es quien tiene acceso a las cuentas de producción y a los servicios configurados.

---

# Arquitectura del sistema

Actualmente SCARH está compuesto por los siguientes servicios:

| Componente                  | Servicio   | Urls
| --------------------------- | ---------- | ----------------------------
| Backend API (Django)        | Render     | https://scarh.onrender.com
| Base de datos PostgreSQL    | Supabase   | -
| Frontend (Next.js)          | Vercel     | https://scarh.vercel.app/
| Imágenes Docker del backend | Docker Hub | https://hub.docker.com/repository/docker/felixop/scarh

La base de datos utilizada en producción ya se encuentra creada y administrada en **Supabase**.

La API de producción está desplegada en **Render**.

El frontend de producción está desplegado en **Vercel**.

---

# Archivos principales

En el backend existen los siguientes archivos relacionados con construcción y despliegue:

```text
.
├── Dockerfile.production
├── compose.production.yml
├── .release.ps1
├── VERSION
└── .env
```

## Dockerfile.production

Define cómo se construye la imagen Docker del backend para producción.

## compose.production.yml

Define cómo ejecutar el backend utilizando Docker Compose, incluyendo:

* Imagen Docker.
* Variables de entorno.
* Puertos.
* Comandos de inicio.

## VERSION

Contiene la versión actual de la imagen Docker.

Ejemplo:

```text
0.2
```

Las versiones siguen el formato:

```text
major.minor
```

Ejemplos:

```text
0.2
0.3
1.0
```

## .release.ps1

Script utilizado para generar una nueva versión del backend.

Realiza:

* Incremento de versión.
* Construcción de la imagen Docker.
* Creación de tags.
* Publicación en Docker Hub.

---

# Desarrollo local

Esta sección permite ejecutar la aplicación localmente para probar cambios antes de desplegar.

## Requisitos Windows

Instalar:

* Docker Desktop.
* Git.
* PowerShell.

---

## Variables de entorno

Crear un archivo:

```text
.env
```

con las variables necesarias para ejecutar Django.

Ejemplo:

```env
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

ALLOWED_HOSTS=
CSRF_TRUSTED_ORIGINS=
```

La aplicación utiliza la base de datos alojada en Supabase, por lo que el entorno local puede conectarse utilizando las credenciales configuradas.

El archivo `.env` no debe subirse al repositorio.

---

## Construir la imagen local

Desde la carpeta del backend:

```powershell
docker build -f Dockerfile.production -t scarh:local .
```

Esto genera una imagen local:

```text
scarh:local
```

---

## Ejecutar el backend localmente

Levantar los servicios:

```powershell
docker compose -f compose.production.yml up
```

Para ejecutarlo en segundo plano:

```powershell
docker compose -f compose.production.yml up -d
```

La API estará disponible en:

```text
http://localhost:8000
```

---

## Ver logs

Para revisar errores:

```powershell
docker compose -f compose.production.yml logs -f
```

---

## Detener servicios

```powershell
docker compose -f compose.production.yml down
```

---

# Crear una nueva versión del backend

Este paso corresponde al proceso de despliegue.

Antes de crear una nueva versión:

1. Probar los cambios localmente.
2. Verificar que la aplicación inicia correctamente.
3. Confirmar que no existen errores.

Ejecutar:

```powershell
.\release.ps1
```

El script realizará automáticamente:

1. Incremento de versión.
2. Construcción de la imagen Docker.
3. Creación del tag de versión.
4. Creación del tag `latest`.
5. Publicación en Docker Hub.

Ejemplo:

Versión anterior:

```text
felixop/scarh:0.2
```

Nueva versión:

```text
felixop/scarh:0.3
felixop/scarh:latest
```

---

# Despliegue del backend

El backend se ejecuta en Render.

Después de publicar una nueva imagen Docker:

1. Actualizar la versión utilizada por Render.
2. Ejecutar el despliegue desde Render.

La base de datos no se despliega junto con la aplicación porque está gestionada externamente en Supabase.

---

# Despliegue del frontend

El frontend está desarrollado con Next.js y desplegado en Vercel.

Para realizar un despliegue:

1. Entrar en la carpeta del frontend.
2. Ejecutar:

```powershell
vercel
```

3. Seleccionar el proyecto correspondiente cuando Vercel lo solicite.

---

# Flujo general

## Desarrollo

```text
Modificar código
        ↓
Construir imagen local
        ↓
docker compose up
        ↓
Probar cambios
```

## Backend producción

```text
Cambios aprobados
        ↓
release.ps1
        ↓
Docker Hub
        ↓
Render
```

## Frontend producción

```text
Cambios aprobados
        ↓
vercel
        ↓
Vercel
```
