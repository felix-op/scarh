# SCARH

Sistema de Control y Análisis de Recursos Hídricos. Monitoreo de limnígrafos: ingesta de
mediciones, estados de los equipos, alertas, estadísticas y mapa.

- `backend/` — API en Django + Django REST Framework, sobre PostgreSQL.
- `website/` — frontend en Next.js 16 (App Router). Es el frontend vigente.
- `frontend/` — frontend anterior. Se conserva como referencia mientras se termina la
  migración a `website/`; no se le agregan funcionalidades nuevas.
- `simulator-go/` — simulador de limnígrafos que postea mediciones a la API.
- `docker/` — compose y Dockerfiles de cada entorno (ver [Estructura de `docker/`](#estructura-de-docker)).
- `docs/` — reglas de desarrollo (`docs/Rules.md`), documentación técnica
  (`docs/tecnologias/`) y roadmaps (`docs/roadmaps/`).

---

## Desarrollo local

Docker no es obligatorio: es la forma más rápida de tener todo andando, pero backend,
frontend y simulador se pueden correr sueltos (venv de Python, Node/pnpm, Go) siempre que
tengan sus variables de entorno escritas — ver [Variables de entorno](#variables-de-entorno)
más abajo.

Si sólo vas a tocar el frontend, no hace falta levantar backend ni base de datos locales:
apuntá `API_URL` (en `website/.env`) al staging (`https://api.scarh.online`) y trabajá
contra esos datos. La base de datos y el backend locales sólo hacen falta cuando el
trabajo toca código del backend.

### La forma corta: el CLI

```bash
python cli.py
```

Menú interactivo (flechas ↑ ↓, Enter para elegir, `q` para salir) con todo lo habitual:
levantar, levantar reconstruyendo, levantar un servicio solo, ver logs, estado, reiniciar,
bajar conservando o borrando los datos, los comandos de Django y el simulador. No tiene
dependencias: es biblioteca estándar. El detalle de cada opción y su equivalente en
`docker compose` está en [`docs/tecnologias/cli.md`](docs/tecnologias/cli.md).

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

Comandos habituales, comandos de Django, tests, acceso a la base y simulador: todo en
[`docs/tecnologias/cli.md`](docs/tecnologias/cli.md).

### Usuarios que se crean solos

| Usuario | Contraseña | Para qué |
|---|---|---|
| `admin` | `super-secure-password` | Superusuario, rol `administracion` |
| `operador` | `super-secure-password` | Sólo permisos de visualización, para probar los roles |

Están definidos en `docker/desarrollo-local/.env.docker`.

### Datos de prueba

`recursos/datos_limnigrafos.json` tiene ~36.000 mediciones históricas, para probar
listados, gráficos y estadísticas con volumen real en vez de los pocos datos que traen
las fixtures por defecto. Es sólo un fixture de mediciones: usa los limnígrafos que ya
crea `backend/api/fixtures/limnigrafos.json`, no crea limnígrafos nuevos.

Desde el CLI: «Importar datos de prueba (histórico de mediciones)». A mano:

```bash
dcl cp recursos/datos_limnigrafos.json api:/app/datos_limnigrafos.json
dcl exec api python manage.py loaddata /app/datos_limnigrafos.json
```

### Variables de entorno

**Con Docker**, no hay que escribir nada: `docker/desarrollo-local/.env.docker` tiene la
configuración del backend **y** del frontend, y **se versiona a propósito** — no contiene
ninguna credencial real, todo apunta a los contenedores de ese mismo compose. Ese archivo
le gana a `website/.env`: las variables entran al contenedor como variables de entorno
reales, y el cargador de env de Next no sobrescribe lo que ya está en el entorno. Es
importante, porque `website/.env` puede apuntar a producción, y sin esto el frontend local
consultaría producción sin avisar.

Para cambiar los puertos publicados en el host, creá `docker/desarrollo-local/.env` (ese sí
está ignorado, es una preferencia tuya):

```
DB_PUERTO_HOST=5434
API_PUERTO_HOST=8001
WEB_PUERTO_HOST=3001
```

**Sin Docker**, sí hace falta escribirlos a mano, a partir de las plantillas versionadas:

```bash
cp .env.sample .env                    # backend y simulador (raíz del repo)
cp website/.env.sample website/.env    # frontend
```

Ambas plantillas ya apuntan a `localhost` y están comentadas con lo que necesita cada
variable (base de datos local, schema `limnigrafos`, etc.).

### Correo

En local el correo se imprime en la consola en lugar de salir por SMTP. Los códigos de
recuperación de contraseña se leen en los logs (detalle en
[`docs/tecnologias/cli.md`](docs/tecnologias/cli.md)).

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
    init/                  script de creación del schema `limnigrafos`
  staging/
    compose.db.yml         PostgreSQL
    compose.api.yml        Django
    compose.web.yml        Next.js
    compose.nginx.yml      nginx como único backend de Traefik (routing y estáticos)
    nginx.conf
    init/                  script de creación del schema `limnigrafos`
  deploy/
    Dockerfile.api.production   imagen de backend para Docker Hub
    Dockerfile.web.production   imagen de frontend para Docker Hub
```

El `Dockerfile` del simulador es el que ya vive en `simulator-go/`.

`release.py`, en la raíz, publica las imágenes que corren en `docker/staging/` a partir de
los Dockerfiles de `docker/deploy/`. Ver [`docs/DEPLOY.md`](docs/DEPLOY.md) para el flujo
completo de publicación y despliegue.

---

## Documentación

- `docs/Rules.md` — reglas obligatorias de estructura, nomenclatura y sistema de diseño
  del frontend. Leerlo antes de agregar código a `website/app`.
- `docs/tecnologias/cli.md` — referencia completa de `cli.py` y sus equivalentes en
  `docker compose`.
- `docs/DEPLOY.md` — cómo se publican las imágenes y cómo se despliega en el VPS.
- `docs/roadmaps/` — trabajo planificado por área.
- http://localhost:8000/docs/ — documentación interactiva de la API (Swagger).
- `/dashboard/admin/documentacion` en el frontend — catálogo de componentes del sistema de
  diseño.
