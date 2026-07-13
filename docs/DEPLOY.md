# SCARH - Guía de desarrollo local y despliegue

## Introducción

Este documento describe el flujo para trabajar con SCARH en desarrollo local y realizar despliegues de los distintos componentes del sistema.

Las credenciales de acceso a las cuentas y servicios configurados (Render, Vercel, Supabase, Docker Hub) están actualmente en manos de **Felix**.

> ⚠️ **Importante sobre el estado actual del sistema**
>
> Lo que en este documento se llama "producción" (Render, Vercel, Supabase) es en realidad un **entorno de prueba desplegado públicamente**, todavía no es el entorno de producción final del cliente. Nada de lo que ocurre ahí impacta a un cliente real. Cuando el sistema esté completo, se desplegará donde el cliente lo indique, con su propia infraestructura y base de datos.
>
> Justamente por ser una base de datos de prueba compartida (no una base local de cada desarrollador), es importante **usar siempre la base de datos de Supabase en el `.env` en vez de una base de datos local** al trabajar en el backend. Así se evita cargar datos de prueba una y otra vez en bases distintas, y todos trabajan sobre el mismo estado de datos.

---

# Arquitectura del sistema

Actualmente SCARH está compuesto por los siguientes servicios:

| Componente                  | Servicio   | Urls
| --------------------------- | ---------- | ----------------------------
| Backend API (Django)        | Render     | https://scarh.onrender.com
| Base de datos PostgreSQL    | Supabase   | -
| Frontend (Next.js)          | Vercel     | https://scarh.vercel.app/
| Imágenes Docker del backend | Docker Hub | https://hub.docker.com/repository/docker/felixop/scarh

La base de datos utilizada ya se encuentra creada y administrada en **Supabase**. Es una base de datos de prueba, no la base de datos final del cliente.

La API está desplegada en **Render**.

El frontend está desplegado en **Vercel**.

---

# Archivos principales

En el backend existen los siguientes archivos relacionados con construcción y despliegue:

```text
.
├── Dockerfile.production
├── compose.production.yml
├── release.ps1
├── release.sh
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

## release.ps1 / release.sh

Scripts equivalentes utilizados para generar una nueva versión del backend. `release.ps1` es para PowerShell (Windows) y `release.sh` es su equivalente en Bash (Linux/macOS).

Realizan:

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

## Requisitos Linux/macOS

Instalar:

* Docker Engine (o Docker Desktop).
* Git.
* Bash.

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

> ⚠️ El backend puede ejecutarse directamente desde la máquina local (sin Docker) y ejecutar migraciones (`python manage.py migrate`) contra la base de datos de Supabase configurada en `DB_HOST`/`DB_NAME`/etc. del `.env`. Esto significa que **cualquier migración o comando de gestión ejecutado localmente impacta directamente sobre esa base compartida**, aunque no sea la base de producción final. Verificar siempre qué `DB_HOST` está configurado en el `.env` antes de correr migraciones u otros comandos que modifiquen datos.

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

Ejecutar (Windows):

```powershell
.\release.ps1
```

Ejecutar (Linux/macOS):

```bash
./release.sh
```

Ambos scripts aceptan opcionalmente el tipo de release (`minor` o `major`) como parámetro:

```bash
./release.sh minor
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

La base de datos no se despliega junto con la aplicación porque está gestionada externamente en Supabase (base de prueba, ver advertencia al inicio del documento).

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
