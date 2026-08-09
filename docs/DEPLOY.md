# SCARH - Guía de despliegue

## Introducción

Este documento describe cómo se publican y despliegan el backend y el frontend de SCARH.
Para desarrollo local, ver el [`README.md`](../README.md) de la raíz.

> ⚠️ **Todavía no existe un entorno de "producción" separado.** Lo que hoy corre en el VPS
> de Hostinger (`docker/staging/`) es el único entorno desplegado públicamente. Cuando el
> sistema esté completo y el cliente defina su infraestructura final, este documento va a
> tener que separar staging de producción.

---

## Arquitectura del sistema

| Componente | Dónde vive |
|---|---|
| Imágenes Docker (backend y frontend) | Docker Hub — [`felixop/scarh`](https://hub.docker.com/repository/docker/felixop/scarh), `felixop/scarh-frontend` |
| Backend (Django), frontend (Next.js), base de datos (PostgreSQL) | Contenedores Docker en un VPS de Hostinger, en `/var/contenedores` |
| TLS y ruteo por dominio | Traefik, corriendo en el mismo VPS **fuera de este repositorio** (no tiene compose acá; descubre los contenedores por las labels de Docker) |

Los compose que definen los servicios del VPS están en
[`docker/staging/`](../docker/staging/): `compose.db.yml`, `compose.api.yml`,
`compose.web.yml` y `compose.nginx.yml`, más `nginx.conf` e `init/` (creación del schema
`limnigrafos`). Se levantan juntos, bajo el mismo proyecto, para que compartan volúmenes:

```bash
docker compose -p scarh \
  -f compose.db.yml \
  -f compose.api.yml \
  -f compose.web.yml \
  -f compose.nginx.yml \
  up -d
```

`nginx` es el único servicio con labels de Traefik: hace de backend único para los dos
dominios y resuelve el ruteo interno (estáticos/media del backend, API, frontend) por su
cuenta. `db`, `api` y `web` no llevan labels — no son alcanzables desde afuera salvo a
través de `nginx`.

---

## Archivos principales

```text
.
├── release.py
├── docker/
│   ├── deploy/
│   │   ├── Dockerfile.api.production
│   │   └── Dockerfile.web.production
│   └── staging/
└── VERSION
```

### docker/deploy/Dockerfile.api.production / Dockerfile.web.production

Definen cómo se construyen las imágenes Docker de backend y frontend para publicar en
Docker Hub. El contexto de build sigue siendo la raíz del repositorio (`COPY backend ...`,
`COPY website ...` son relativos a ahí), por eso `release.py` siempre invoca `docker build`
con `cwd` en la raíz aunque el `Dockerfile` viva en `docker/deploy/`.

### VERSION

Guarda la versión actual de cada imagen, en líneas independientes:

```text
BACKEND=0.30
FRONTEND=0.6
```

### release.py

Construye y publica una imagen nueva en Docker Hub. Un solo script (antes eran
`release.sh` y `release.ps1` por separado) porque no tiene dependencias externas y corre
igual en Windows, Linux y macOS.

Se corre desde la raíz del repositorio (ahí vive). Pide qué publicar y qué tipo de
release, o los toma como argumentos:

```bash
python release.py backend minor     # o: frontend major
```

El script:

1. Incrementa la línea correspondiente (`BACKEND` o `FRONTEND`) en `VERSION` — `minor`
   suma 1 al segundo número, `major` suma 1 al primero y resetea el segundo a 0.
2. Construye la imagen con el `Dockerfile` correspondiente (en `docker/deploy/`), taggeada
   con la versión nueva y con `latest`.
3. Publica ambos tags en Docker Hub.

---

## Publicar una versión nueva

Antes de publicar:

1. Probar los cambios en local (ver `README.md`).
2. Verificar que la aplicación arranca sin errores.

```bash
python release.py backend minor
# o
python release.py frontend minor
```

---

## Desplegar en el VPS

Con la imagen ya publicada en Docker Hub:

```bash
ssh <usuario>@<host>
cd /var/contenedores
docker compose -p scarh -f compose.db.yml -f compose.api.yml -f compose.web.yml -f compose.nginx.yml pull
docker compose -p scarh -f compose.db.yml -f compose.api.yml -f compose.web.yml -f compose.nginx.yml up -d
```

`api` corre `collectstatic`, `migrate` y `runserver` en su propio arranque (ver
`docker/staging/compose.api.yml`), así que no hace falta ningún paso manual extra para
aplicar migraciones.

El `.env` con las credenciales reales (`DB_*`, `SECRET_KEY`, `API_URL`, etc.) vive
directamente en `/var/contenedores` del VPS — no está versionado en este repositorio.

### Ver logs

```bash
docker compose -p scarh -f compose.api.yml logs -f api
```

### Bajar servicios

```bash
docker compose -p scarh -f compose.db.yml -f compose.api.yml -f compose.web.yml -f compose.nginx.yml down
```
