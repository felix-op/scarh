#!/usr/bin/env python3
"""CLI del entorno de desarrollo local.

Menú interactivo para manejar el stack de Docker (base de datos, backend y frontend) y
para correr los comandos de Django dentro del contenedor, sin tener que recordar la ruta
del compose ni entrar al contenedor a mano.

    python cli.py

Se navega con las flechas ↑ ↓ y se elige con Enter. `q` o Esc salen.

No usa dependencias externas a propósito: la idea es que funcione recién clonado el
repositorio, sin instalar nada.
"""

import json
import os
import re
import selectors
import shutil
import subprocess
import sys
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
ARCHIVO_COMPOSE = RAIZ / "docker" / "desarrollo-local" / "docker-compose.yml"
ARCHIVO_CONFIG_SIMULADOR = RAIZ / "simulator-go" / "config.yaml"
# El simulador vive detrás de un perfil del compose, así que hay que habilitarlo para que
# los comandos lo alcancen.
COMPOSE = ["docker", "compose", "-f", str(ARCHIVO_COMPOSE), "--profile", "simulador"]

SERVICIOS = [
    ("db", "Base de datos (PostgreSQL)"),
    ("api", "Backend (Django)"),
    ("web", "Frontend (Next.js)"),
    ("alertas", "Generador periódico de alertas"),
]

# ---------------------------------------------------------------------------
# Presentación
# ---------------------------------------------------------------------------

COLOR = sys.stdout.isatty() and os.environ.get("NO_COLOR") is None


def _c(texto, codigo):
    return f"\033[{codigo}m{texto}\033[0m" if COLOR else texto


def seleccionado(texto):
    """Resaltado de la opción activa: fondo azul, texto blanco."""
    return _c(f" {texto} ", "44;97;1")


def apagado(texto):
    return _c(texto, "2")


def titulo(texto):
    return _c(texto, "1;36")


def exito(texto):
    return _c(texto, "32")


def error(texto):
    return _c(texto, "31")


def limpiar_pantalla():
    if COLOR:
        print("\033[2J\033[H", end="")


# ---------------------------------------------------------------------------
# Lectura de teclas
# ---------------------------------------------------------------------------


def _leer_tecla_windows():
    import msvcrt

    tecla = msvcrt.getwch()
    if tecla in ("\x00", "\xe0"):
        segunda = msvcrt.getwch()
        return {"H": "arriba", "P": "abajo"}.get(segunda, "")
    if tecla in ("\r", "\n"):
        return "enter"
    if tecla == "\x1b":
        return "escape"
    if tecla == "\x03":
        raise KeyboardInterrupt
    return tecla.lower()


class modo_tecla:
    """Pone la terminal en modo carácter a carácter, sin echo, mientras dura el menú.

    Se entra una sola vez por menú y no una vez por tecla: si se activara y desactivara
    en cada lectura, las teclas apretadas durante el redibujado se echarían en pantalla.

    Usa `setcbreak` y no `setraw` porque cbreak deja el procesamiento de salida activo, y
    así los `\\n` de los `print` siguen funcionando normalmente.
    """

    def __init__(self):
        self.fd = None
        self.previo = None

    def __enter__(self):
        if os.name == "nt" or not sys.stdin.isatty():
            return self
        import termios
        import tty

        self.fd = sys.stdin.fileno()
        self.previo = termios.tcgetattr(self.fd)
        tty.setcbreak(self.fd)
        return self

    def __exit__(self, *_):
        if self.fd is not None:
            import termios

            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.previo)
        return False


def _leer_tecla_posix():
    # Se lee del descriptor con `os.read` y no con `sys.stdin.read`: el buffer de
    # `sys.stdin` se puede quedar con el resto de una secuencia de escape, y entonces el
    # `select` de abajo no la ve y una flecha se confunde con un Esc suelto.
    fd = sys.stdin.fileno()
    datos = os.read(fd, 6)
    if not datos:
        return "escape"

    if datos[:1] == b"\x03":
        raise KeyboardInterrupt
    if datos[:1] in (b"\r", b"\n"):
        return "enter"

    if datos[:1] == b"\x1b":
        if len(datos) == 1:
            # Esc solo, o el terminal partió la secuencia. Se espera un instante.
            selector = selectors.DefaultSelector()
            selector.register(fd, selectors.EVENT_READ)
            hay_mas = bool(selector.select(timeout=0.05))
            selector.close()
            if not hay_mas:
                return "escape"
            datos += os.read(fd, 5)
        return {b"[A": "arriba", b"[B": "abajo"}.get(datos[1:3], "")

    return datos[:1].decode(errors="replace").lower()


def leer_tecla():
    if os.name == "nt":
        return _leer_tecla_windows()
    return _leer_tecla_posix()


# ---------------------------------------------------------------------------
# Menú
# ---------------------------------------------------------------------------


def elegir(encabezado, opciones, texto_salida="Salir"):
    """Muestra un menú y devuelve el valor de la opción elegida, o None si se cancela.

    `opciones` es una lista de `(etiqueta, valor)`. Una etiqueta con valor `None` se
    dibuja como separador y no se puede seleccionar.
    """
    seleccionables = [i for i, (_, valor) in enumerate(opciones) if valor is not None]
    if not seleccionables:
        return None

    if not sys.stdin.isatty():
        return _elegir_sin_tty(encabezado, opciones, seleccionables)

    actual = seleccionables[0]
    lineas_dibujadas = 0

    with modo_tecla():
        while True:
            if lineas_dibujadas:
                print(f"\033[{lineas_dibujadas}A\033[J", end="")

            buffer = [titulo(encabezado), ""]
            for indice, (etiqueta, valor) in enumerate(opciones):
                if valor is None:
                    buffer.append(f"  {apagado(etiqueta)}")
                elif indice == actual:
                    buffer.append(f"› {seleccionado(etiqueta)}")
                else:
                    buffer.append(f"  {etiqueta}")
            buffer.append("")
            buffer.append(apagado(f"↑ ↓ para moverse · Enter para elegir · q para {texto_salida.lower()}"))

            print("\n".join(buffer), flush=True)
            lineas_dibujadas = len(buffer)

            tecla = leer_tecla()
            if tecla == "arriba":
                posicion = seleccionables.index(actual)
                actual = seleccionables[(posicion - 1) % len(seleccionables)]
            elif tecla == "abajo":
                posicion = seleccionables.index(actual)
                actual = seleccionables[(posicion + 1) % len(seleccionables)]
            elif tecla == "enter":
                return opciones[actual][1]
            elif tecla in ("q", "escape"):
                return None


def _elegir_sin_tty(encabezado, opciones, seleccionables):
    """Menú numerado, para cuando no hay terminal interactiva (pipes, CI)."""
    print(encabezado)
    for numero, indice in enumerate(seleccionables, start=1):
        print(f"  {numero}. {opciones[indice][0]}")
    try:
        elegido = input("Número (vacío para salir): ").strip()
    except EOFError:
        return None
    if not elegido.isdigit() or not 1 <= int(elegido) <= len(seleccionables):
        return None
    return opciones[seleccionables[int(elegido) - 1]][1]


def confirmar(pregunta):
    return elegir(pregunta, [("No", False), ("Sí", True)], texto_salida="cancelar") is True


def pausar():
    if not sys.stdin.isatty():
        return
    print()
    print(apagado("Enter para volver al menú..."), flush=True)
    try:
        with modo_tecla():
            while leer_tecla() not in ("enter", "escape", "q"):
                pass
    except KeyboardInterrupt:
        pass


# ---------------------------------------------------------------------------
# Docker
# ---------------------------------------------------------------------------


def correr(comando, permitir_interrupcion=False):
    """Ejecuta un comando mostrando su salida. Devuelve True si terminó bien."""
    print(apagado("$ " + " ".join(comando)))
    print()
    try:
        codigo = subprocess.run(comando, cwd=RAIZ).returncode
    except KeyboardInterrupt:
        if permitir_interrupcion:
            print()
            print(apagado("Interrumpido."))
            return True
        raise
    except FileNotFoundError:
        print(error(f"No se encontró el ejecutable «{comando[0]}»."))
        return False

    print()
    if codigo == 0:
        print(exito("✓ Listo."))
    else:
        print(error(f"✗ Terminó con código {codigo}."))
    return codigo == 0


def servicios_corriendo():
    try:
        salida = subprocess.run(
            COMPOSE + ["ps", "--services", "--status", "running"],
            cwd=RAIZ,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        return []
    return [linea.strip() for linea in salida.stdout.splitlines() if linea.strip()]


def elegir_servicio(encabezado, incluir_todos=False):
    opciones = []
    if incluir_todos:
        opciones.append(("Todos", "__todos__"))
    opciones += [(f"{nombre} — {descripcion}", nombre) for nombre, descripcion in SERVICIOS]
    return elegir(encabezado, opciones, texto_salida="volver")


def seguir_logs(servicio=None):
    comando = COMPOSE + ["logs", "-f", "--tail", "50"]
    if servicio and servicio != "__todos__":
        comando.append(servicio)
    print(apagado("Ctrl+C para cortar y volver al menú."))
    print()
    correr(comando, permitir_interrupcion=True)


def levantar(reconstruir=False, servicio=None):
    comando = COMPOSE + ["up", "-d"]
    if reconstruir:
        comando.append("--build")
    if servicio and servicio != "__todos__":
        comando.append(servicio)

    if not correr(comando):
        pausar()
        return

    print()
    print("  Frontend  http://localhost:3000")
    print("  Backend   http://localhost:8000")
    print("  Swagger   http://localhost:8000/docs/")
    print()
    print(apagado("El primer arranque aplica migraciones y carga las fixtures, así que la"))
    print(apagado("API tarda unos segundos en responder."))
    print()

    if confirmar("¿Querés quedarte escuchando los logs?"):
        objetivo = servicio if servicio and servicio != "__todos__" else None
        if objetivo is None:
            objetivo = elegir_servicio("¿De qué servicio?", incluir_todos=True)
        if objetivo:
            seguir_logs(objetivo)
    else:
        pausar()


def bajar(borrar_datos=False):
    if borrar_datos and not confirmar("Esto borra la base de datos local. ¿Seguro?"):
        return
    comando = COMPOSE + ["down"]
    if borrar_datos:
        comando.append("-v")
    correr(comando)
    pausar()


def reiniciar():
    servicio = elegir_servicio("¿Qué servicio reiniciar?")
    if servicio:
        correr(COMPOSE + ["restart", servicio])
        pausar()


def estado():
    correr(COMPOSE + ["ps"])
    pausar()


# ---------------------------------------------------------------------------
# Django
# ---------------------------------------------------------------------------


def manage(*argumentos, interactivo=False, capturar=False):
    """Corre `manage.py` dentro del contenedor del backend, vía `exec`.

    Requiere que el contenedor esté corriendo: el entrypoint de la imagen arranca el
    servidor y no acepta un comando alternativo, así que `docker compose run` no sirve
    para esto.
    """
    if "api" not in servicios_corriendo():
        print(error("El backend no está corriendo."))
        print()
        if not confirmar("¿Lo levanto ahora?"):
            return None if capturar else False
        if not correr(COMPOSE + ["up", "-d", "api"]):
            return None if capturar else False
        print()
        print(apagado("Esperando a que la API responda..."))
        if not esperar_api():
            print(error("La API no llegó a estar lista."))
            return None if capturar else False

    base = COMPOSE + ["exec"]
    if not interactivo:
        base.append("-T")
    comando = base + ["api", "python", "manage.py", *argumentos]

    if capturar:
        print(apagado("$ " + " ".join(comando)))
        resultado = subprocess.run(comando, cwd=RAIZ, capture_output=True, text=True)
        if resultado.returncode != 0:
            print(error(resultado.stderr.strip() or f"Terminó con código {resultado.returncode}."))
            return None
        return resultado.stdout

    return correr(comando, permitir_interrupcion=interactivo)


def esperar_api(intentos=60):
    """Espera a que el healthcheck del contenedor de la API pase a `healthy`."""
    for _ in range(intentos):
        resultado = subprocess.run(
            ["docker", "inspect", "-f", "{{.State.Health.Status}}", "labsoft_api"],
            cwd=RAIZ,
            capture_output=True,
            text=True,
        )
        if resultado.stdout.strip() == "healthy":
            return True
        time.sleep(2)
    return False


# ---------------------------------------------------------------------------
# Simulador
# ---------------------------------------------------------------------------

# Perfil por defecto para un limnígrafo que todavía no está en el config.yaml. Son los
# mismos valores que ya usaba el archivo; el roadmap del simulador los revisa (las alturas
# están en metros cuando el equipo real mide en centímetros).
PLANTILLA_DISPOSITIVO = """    - id: {id}
      token: {token}
      altura_min: 0.5
      altura_max: 3.5
      temperatura_min: 0
      temperatura_max: 11
      presion_min: 950
      presion_max: 1050
      bateria_max: 100
      bateria_min: 10
      probabilidad_falla: 0.006
      duracion_falla_min: 8
      duracion_falla_max: 11"""


def _reescribir_tokens(texto, claves):
    """Reemplaza los `token:` del config.yaml por los de `claves`, matcheando por id.

    Se edita por líneas en lugar de parsear el YAML porque `pyyaml` no es de la biblioteca
    estándar y este CLI no tiene dependencias. Alcanza: el archivo tiene una estructura
    fija y así se preservan los perfiles físicos de cada dispositivo tal como estaban.

    Los dispositivos del archivo que ya no existen en la base se eliminan, y los que están
    en la base y no en el archivo se agregan con el perfil por defecto.
    """
    lineas = texto.splitlines()
    try:
        corte = next(i for i, linea in enumerate(lineas) if linea.strip() == "limnigrafos:")
    except StopIteration:
        raise ValueError("El config.yaml no tiene la clave `limnigrafos:`.")

    cabecera = lineas[: corte + 1]

    bloques = []
    for linea in lineas[corte + 1 :]:
        if re.match(r"\s*-\s*id:\s*\d+", linea):
            bloques.append([linea])
        elif bloques:
            bloques[-1].append(linea)

    token_por_id = {clave["id"]: clave["token"] for clave in claves}
    salida = list(cabecera)
    conservados = set()
    eliminados = []

    for bloque in bloques:
        identificador = int(re.match(r"\s*-\s*id:\s*(\d+)", bloque[0]).group(1))
        if identificador not in token_por_id:
            eliminados.append(identificador)
            continue
        conservados.add(identificador)
        for linea in bloque:
            if re.match(r"\s*token:", linea):
                sangria = linea[: len(linea) - len(linea.lstrip())]
                salida.append(f"{sangria}token: {token_por_id[identificador]}")
            else:
                salida.append(linea)

    agregados = []
    for clave in claves:
        if clave["id"] in conservados:
            continue
        agregados.append(clave["id"])
        salida.append(PLANTILLA_DISPOSITIVO.format(id=clave["id"], token=clave["token"]))

    while salida and not salida[-1].strip():
        salida.pop()

    return "\n".join(salida) + "\n", sorted(conservados), eliminados, agregados


def sincronizar_tokens():
    print(titulo("Sincronizar los tokens del simulador"))
    print()
    print(apagado("Genera una API Key nueva para cada limnígrafo de la base y la escribe en"))
    print(apagado("simulator-go/config.yaml. Las claves anteriores quedan invalidadas."))
    print()

    if not ARCHIVO_CONFIG_SIMULADOR.exists():
        print(error(f"No existe {ARCHIVO_CONFIG_SIMULADOR.relative_to(RAIZ)}."))
        pausar()
        return

    if not confirmar("¿Sigo?"):
        return

    print()
    salida = manage("generar_claves_simulador", capturar=True)
    if salida is None:
        pausar()
        return

    try:
        # La última línea con contenido es el JSON; antes puede haber warnings de librerías.
        crudo = [linea for linea in salida.splitlines() if linea.strip()][-1]
        claves = json.loads(crudo)
    except (IndexError, json.JSONDecodeError):
        print(error("No se pudo interpretar la respuesta del backend:"))
        print(salida[:400])
        pausar()
        return

    if not claves:
        print(error("La base no tiene limnígrafos. Cargá las fixtures primero."))
        pausar()
        return

    try:
        contenido, conservados, eliminados, agregados = _reescribir_tokens(
            ARCHIVO_CONFIG_SIMULADOR.read_text(encoding="utf-8"), claves
        )
    except ValueError as excepcion:
        print(error(str(excepcion)))
        pausar()
        return

    ARCHIVO_CONFIG_SIMULADOR.write_text(contenido, encoding="utf-8")

    print()
    print(exito(f"✓ {len(claves)} token(s) actualizado(s) en simulator-go/config.yaml."))
    for clave in claves:
        print(f"    {clave['codigo']:<26} id={clave['id']:<3} {clave['token'][:8]}…")
    if agregados:
        print(exito(f"  + agregados al archivo: {', '.join(str(i) for i in agregados)}"))
    if eliminados:
        print(apagado(f"  - eliminados (ya no existen en la base): {', '.join(str(i) for i in eliminados)}"))
    print()
    print(apagado("Si el simulador está corriendo, reinicialo para que tome los tokens nuevos."))
    pausar()


def levantar_simulador():
    if not correr(COMPOSE + ["up", "-d", "--build", "simulador"]):
        pausar()
        return
    print()
    print(apagado("Si las mediciones dan 401 o 403, sincronizá los tokens y reinicialo."))
    print()
    if confirmar("¿Querés quedarte escuchando los logs?"):
        seguir_logs("simulador")
    else:
        pausar()


def detener_simulador():
    correr(COMPOSE + ["stop", "simulador"])
    pausar()


def comando_libre():
    if not sys.stdin.isatty():
        return
    print(titulo("Comando de manage.py"))
    print()
    print(apagado("Escribí sólo los argumentos. Ejemplo: dumpdata api.Rol --indent 2"))
    print()
    try:
        entrada = input("manage.py ").strip()
    except (EOFError, KeyboardInterrupt):
        return
    if entrada:
        manage(*entrada.split(), interactivo=True)
        pausar()


# ---------------------------------------------------------------------------
# Menú principal
# ---------------------------------------------------------------------------

ACCIONES = {
    "up": lambda: levantar(),
    "up_build": lambda: levantar(reconstruir=True),
    "up_uno": lambda: _levantar_uno(),
    "logs": lambda: _logs(),
    "ps": estado,
    "restart": reiniciar,
    "down": lambda: bajar(),
    "down_v": lambda: bajar(borrar_datos=True),
    "makemigrations": lambda: (manage("makemigrations", "api"), pausar()),
    "migrate": lambda: (manage("migrate"), pausar()),
    "superuser": lambda: (manage("createsuperuser", interactivo=True), pausar()),
    "shell": lambda: manage("shell", interactivo=True),
    "test": lambda: (manage("test", "api"), pausar()),
    "alertas": lambda: (manage("generar_alerta"), pausar()),
    "libre": comando_libre,
    "sim_tokens": sincronizar_tokens,
    "sim_up": levantar_simulador,
    "sim_logs": lambda: seguir_logs("simulador"),
    "sim_stop": detener_simulador,
}


def _levantar_uno():
    servicio = elegir_servicio("¿Qué servicio levantar?")
    if servicio:
        levantar(servicio=servicio)


def _logs():
    servicio = elegir_servicio("¿De qué servicio ver los logs?", incluir_todos=True)
    if servicio:
        seguir_logs(servicio)


OPCIONES_MENU = [
    ("Docker", None),
    ("Levantar todo", "up"),
    ("Levantar todo reconstruyendo las imágenes", "up_build"),
    ("Levantar un servicio", "up_uno"),
    ("Ver logs", "logs"),
    ("Ver estado de los servicios", "ps"),
    ("Reiniciar un servicio", "restart"),
    ("Bajar (conserva los datos)", "down"),
    ("Bajar y borrar los datos", "down_v"),
    ("", None),
    ("Django", None),
    ("Crear migraciones", "makemigrations"),
    ("Aplicar migraciones", "migrate"),
    ("Crear superusuario", "superuser"),
    ("Abrir la shell de Django", "shell"),
    ("Correr los tests", "test"),
    ("Generar alertas (recalcula estados)", "alertas"),
    ("Ejecutar otro comando de manage.py", "libre"),
    ("", None),
    ("Simulador", None),
    ("Sincronizar los tokens con la base", "sim_tokens"),
    ("Levantar el simulador", "sim_up"),
    ("Ver logs del simulador", "sim_logs"),
    ("Detener el simulador", "sim_stop"),
]


def verificar_entorno():
    if shutil.which("docker") is None:
        print(error("No se encontró Docker. Instalalo antes de usar este CLI."))
        return False
    if not ARCHIVO_COMPOSE.exists():
        print(error(f"Falta {ARCHIVO_COMPOSE.relative_to(RAIZ)}."))
        return False
    return True


def main():
    if not verificar_entorno():
        return 1

    while True:
        limpiar_pantalla()
        print(titulo("SCARH · entorno de desarrollo local"))
        print()

        accion = elegir("¿Qué querés hacer?", OPCIONES_MENU)
        if accion is None:
            print()
            print(apagado("Chau."))
            return 0

        limpiar_pantalla()
        try:
            ACCIONES[accion]()
        except KeyboardInterrupt:
            print()
            print(apagado("Cancelado."))


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        sys.exit(130)
