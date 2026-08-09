# CLI de desarrollo local (`cli.py`)

Menú interactivo para manejar el stack de Docker (base de datos, backend y frontend) y
para correr los comandos de Django dentro del contenedor, sin tener que recordar la ruta
del compose ni entrar al contenedor a mano.

```bash
python cli.py
```

Se navega con las flechas ↑ ↓, Enter elige, `q` o Esc salen. No tiene dependencias: es
biblioteca estándar de Python, así que corre recién clonado el repositorio.

Este documento detalla lo que hace cada opción del menú y su equivalente en
`docker compose`, por si hace falta correrlo suelto. Conviene un alias para lo segundo:

```bash
alias dcl='docker compose -f docker/desarrollo-local/docker-compose.yml'
```

---

## Docker

| Opción del menú | Equivalente |
|---|---|
| Levantar todo | `dcl up -d` |
| Levantar todo reconstruyendo las imágenes | `dcl up -d --build` |
| Levantar un servicio | `dcl up -d <servicio>` |
| Ver logs | `dcl logs -f <servicio>` |
| Ver estado de los servicios | `dcl ps` |
| Reiniciar un servicio | `dcl restart <servicio>` |
| Bajar (conserva los datos) | `dcl down` |
| Bajar y borrar los datos | `dcl down -v` |

Cuando se cambian las dependencias hay que reconstruir la imagen correspondiente:
agregar algo a `backend/requirements.txt` o a `website/package.json` no alcanza con
reiniciar.

```bash
dcl build api && dcl up -d api
dcl build web && dcl up -d web
```

El código de `backend/` y `website/` está montado desde el host, así que los cambios en
el código se recargan solos: no hay que reconstruir nada para editar.

## Django

| Opción del menú | Equivalente |
|---|---|
| Crear migraciones | `dcl exec api python manage.py makemigrations api` |
| Aplicar migraciones | `dcl exec api python manage.py migrate` |
| Crear superusuario | `dcl exec api python manage.py createsuperuser` |
| Abrir la shell de Django | `dcl exec api python manage.py shell` |
| Correr los tests | `dcl exec api python manage.py test api` |
| Generar alertas (recalcula estados) | `dcl exec api python manage.py generar_alerta` |
| Ejecutar otro comando de manage.py | `dcl exec api python manage.py <lo que sea>` |
| Importar datos de prueba (histórico de mediciones) | ver [Datos de prueba](../../README.md#datos-de-prueba) en el README |

### Tests del backend

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

## Simulador

El simulador (`simulator-go/`) genera mediciones y las postea a la API. Está detrás de un
perfil del compose, así que **no arranca con `up -d`**: se prende a demanda.

| Opción del menú | Equivalente |
|---|---|
| Sincronizar los tokens con la base | — (sólo desde el CLI, ver abajo) |
| Levantar el simulador | `dcl --profile simulador up -d --build simulador` |
| Ver logs del simulador | `dcl --profile simulador logs -f simulador` |
| Detener el simulador | `dcl --profile simulador stop simulador` |

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

## Correo

En local el correo se imprime en la consola en lugar de salir por SMTP. Los códigos de
recuperación de contraseña se leen en los logs:

```bash
dcl logs -f api
```
