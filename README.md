# SCARH

Sistema de Control y Análisis de Recursos Hídricos. Monitoreo de limnígrafos: ingesta de
mediciones, estados de los equipos, alertas, estadísticas y mapa.

- `backend/` — API en Django + Django REST Framework, sobre PostgreSQL.
- `website/` — frontend en Next.js 16 (App Router). Es el frontend vigente.
- `frontend/` — frontend anterior. Se conserva como referencia mientras se termina la
  migración a `website/`; no se le agregan funcionalidades nuevas.
- `simulator-go/` — simulador de limnígrafos que postea mediciones a la API.
- `docs/` — reglas de desarrollo (`docs/Rules.md`) y roadmaps.

---

## Desarrollo local

Todo corre en Docker: base de datos, backend, frontend y simulador. No hace falta entorno
virtual de Python, ni Node, ni pnpm instalados en la máquina — sólo Docker.

### La forma corta: el CLI

```bash
python cli.py
```

Menú interactivo (flechas ↑ ↓, Enter para elegir, `q` para salir) con todo lo habitual:
levantar, levantar reconstruyendo, levantar un servicio solo, ver logs, estado, reiniciar,
bajar conservando o borrando los datos, los comandos de Django y el simulador. No tiene
dependencias: es biblioteca estándar.

### La forma larga: docker compose a mano

**Desde la raíz del repositorio:**

```bash
docker compose -f docker/desarrollo-local/docker-compose.yml up -d
```

El `-f` con la ruta completa es a propósito: hace que el contexto de build sea la raíz del
repositorio, que es lo que necesitan los Dockerfiles para copiar `backend/` y `website/`.
Si entrás a `docker/desarrollo-local/` y corrés `docker compose up`, el contexto también
resuelve bien, porque las rutas del compose son relativas a su propia carpeta.

Queda levantado:

| Servicio | Contenedor | URL |
|---|---|---|
| Frontend (Next.js, `pnpm dev`) | `labsoft_web` | http://localhost:3000 |
| Backend (Django `runserver`) | `labsoft_api` | http://localhost:8000 |
| Documentación de la API (Swagger) | — | http://localhost:8000/docs/ |
| Admin de Django | — | http://localhost:8000/admin/ |
| PostgreSQL | `labsoft_db` | `localhost:5433` |

El primer arranque tarda un poco más: además de construir las imágenes, aplica las
migraciones, carga las fixtures de roles, limnígrafos y ubicaciones, y crea los usuarios.
El frontend levanta enseguida; las pantallas que consultan la API andan en cuanto Django
termina. Para ver el progreso:

```bash
docker compose -f docker/desarrollo-local/docker-compose.yml logs -f api
```

### Usuarios que se crean solos

| Usuario | Contraseña | Para qué |
|---|---|---|
| `admin` | `super-secure-password` | Superusuario, rol `administracion` |
| `operador` | `super-secure-password` | Sólo permisos de visualización, para probar los roles |

Están definidos en `docker/desarrollo-local/.env.docker`.

### Variables de entorno

`docker/desarrollo-local/.env.docker` tiene la configuración del backend **y** del
frontend, y **se versiona a propósito**: no contiene ninguna credencial real, todo apunta
a los contenedores de ese mismo compose.

Se llama `.env.docker` y no `.env.local` porque el `.gitignore` de la raíz ignora
`.env.local`.

Ese archivo le gana a `website/.env`. Las variables entran al contenedor como variables de
entorno reales, y el cargador de env de Next no sobrescribe lo que ya está en el entorno.
Es importante: `website/.env` apunta a la API de producción, y sin esto el frontend local
consultaría producción sin avisar.

Para cambiar los puertos publicados en el host, creá `docker/desarrollo-local/.env` (ese sí
está ignorado, es una preferencia tuya):

```
DB_PUERTO_HOST=5434
API_PUERTO_HOST=8001
WEB_PUERTO_HOST=3001
```

### Comandos habituales

Todo esto está en `cli.py`; quedan acá por si hace falta correrlos suelto. Conviene un
alias:

```bash
alias dcl='docker compose -f docker/desarrollo-local/docker-compose.yml'
```

```bash
dcl up -d                  # levantar
dcl up -d --build          # levantar reconstruyendo las imágenes
dcl ps                     # estado de los servicios
dcl logs -f api            # logs del backend (o web, o db)
dcl down                   # bajar, conservando los datos
dcl down -v                # bajar y borrar la base de datos
dcl restart api            # reiniciar un servicio
```

Cuando se cambian las dependencias hay que reconstruir la imagen correspondiente: agregar
algo a `backend/requirements.txt` o a `website/package.json` no alcanza con reiniciar.

```bash
dcl build api && dcl up -d api
dcl build web && dcl up -d web
```

El código de `backend/` y `website/` está montado desde el host, así que los cambios en el
código se recargan solos: no hay que reconstruir nada para editar.

### Comandos de Django

```bash
dcl exec api python manage.py migrate
dcl exec api python manage.py makemigrations api
dcl exec api python manage.py createsuperuser
dcl exec api python manage.py shell
dcl exec api python manage.py generar_alerta    # recalcula estados y genera/cierra alertas
```

### Tests del backend

```bash
dcl exec api python manage.py test api
```

Un módulo o un caso puntual:

```bash
dcl exec api python manage.py test api.tests.test_alerta
dcl exec api python manage.py test api.tests.test_alerta.GenerarAlertaCommandTests
```

### Base de datos

Django usa el schema `limnigrafos`, que se crea en el primer arranque con
`init/001_create_schema.sql`.

```bash
dcl exec db psql -U labsoft -d labsoft
```

Desde el host (pgAdmin, DBeaver, psql): `localhost:5433`, base `labsoft`, usuario
`labsoft`, contraseña `labsoft`.

Para empezar de cero:

```bash
dcl down -v && dcl up -d
```

### Simulador

El simulador (`simulator-go/`) genera mediciones y las postea a la API. Está detrás de un
perfil del compose, así que **no arranca con `up -d`**: se prende a demanda.

Desde `cli.py`, en la sección Simulador. A mano:

```bash
dcl --profile simulador up -d --build simulador
dcl --profile simulador logs -f simulador
dcl --profile simulador stop simulador
```

**Antes del primer arranque hay que sincronizar los tokens** (opción «Sincronizar los
tokens con la base» del CLI). Sin eso el simulador manda claves de una base que ya no
existe y la API responde 403.

Cómo funciona la sincronización, que es menos obvio de lo que parece:

- El dispositivo se autentica con una API Key de `rest_framework_api_key`
  (`Authorization: Api-Key <prefijo>.<secreto>`), y el backend deduce **de qué limnígrafo
  se trata parseando el nombre de la clave** (`LMG-{id}_...`).
- El campo `Limnigrafo.token_hash` que traen las fixtures **no participa**: `generar_token`
  y `validar_token` no se llaman desde ningún lado. Son SHA-256, además, así que de ahí no
  sale ningún token usable.
- Por eso sincronizar significa **generar claves nuevas** para los limnígrafos que existen
  en la base y escribirlas en `simulator-go/config.yaml`. El comando
  `manage.py generar_claves_simulador` las emite en JSON y el CLI escribe el archivo; el
  backend nunca toca la carpeta del simulador.
- La sincronización respeta el perfil físico de cada dispositivo, borra del archivo los que
  ya no existen en la base y agrega los nuevos con un perfil por defecto.
- Regenerar **invalida** la clave anterior de ese limnígrafo.

Dos cosas a tener en cuenta:

- `simulator-go/config.yaml` está versionado, así que las claves generadas quedan en un
  archivo del repositorio. Son de la base local y no sirven para nada más, pero lo prolijo
  es sacarlo del control de versiones (está anotado en `docs/roadmaps/roadmap-simulador.md`,
  A.0).
- El simulador todavía genera valores que no corresponden a lo que mide el equipo real
  (alturas en metros donde el dispositivo reporta centímetros, presión atmosférica en lugar
  de relativa, batería en porcentaje en lugar de volts). Todo eso está relevado en
  `docs/roadmaps/roadmap-simulador.md` y no está arreglado.

### Correo

En local el correo se imprime en la consola en lugar de salir por SMTP. Los códigos de
recuperación de contraseña se leen en los logs:

```bash
dcl logs -f api
```

---

## Estructura de `docker/`

```
docker/
  desarrollo-local/
    docker-compose.yml     base de datos + backend + frontend + simulador (por perfil)
    Dockerfile.api         Django con runserver y recarga automática
    Dockerfile.web         Next.js con pnpm dev
    entrypoint.api.sh      migraciones, fixtures y usuarios antes de arrancar
    .env.docker            configuración local, versionada
```

El `Dockerfile` del simulador es el que ya vive en `simulator-go/`.

Los compose y Dockerfiles de producción y del simulador siguen por ahora en la raíz
(`compose.production.yml`, `compose.db.production.yml`, `compose.simulator.yml`,
`Dockerfile.api.production`, `Dockerfile.web.production`). La idea es que también pasen a
`docker/`, en sus propias carpetas.

---

## Documentación

- `docs/Rules.md` — reglas obligatorias de estructura, nomenclatura y sistema de diseño
  del frontend. Leerlo antes de agregar código a `website/app`.
- `docs/roadmaps/` — trabajo planificado por área.
- http://localhost:8000/docs/ — documentación interactiva de la API (Swagger).
- `/dashboard/admin/documentacion` en el frontend — catálogo de componentes del sistema de
  diseño.
