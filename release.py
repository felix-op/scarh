#!/usr/bin/env python3
"""Publica una imagen nueva de SCARH (backend o frontend) en Docker Hub.

Reemplaza a `release.sh`/`release.ps1`: un solo script para Windows, Linux y macOS.

    python release.py [backend|frontend] [minor|major]

Sin argumentos, los pregunta por consola. Sin dependencias externas: biblioteca estándar,
igual que `cli.py`.
"""

import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
ARCHIVO_VERSION = RAIZ / "VERSION"

OBJETIVOS = {
    "backend": {
        "imagen": "felixop/scarh",
        "clave": "BACKEND",
        "dockerfile": "docker/deploy/Dockerfile.api.production",
    },
    "frontend": {
        "imagen": "felixop/scarh-frontend",
        "clave": "FRONTEND",
        "dockerfile": "docker/deploy/Dockerfile.web.production",
    },
}
TIPOS = ("minor", "major")


def pedir(mensaje, validos):
    valor = input(mensaje).strip()
    if valor not in validos:
        sys.exit(f"Valor inválido: {valor!r} (debe ser {' o '.join(validos)})")
    return valor


def leer_version(clave):
    if not ARCHIVO_VERSION.exists():
        return "0.0"
    for linea in ARCHIVO_VERSION.read_text().splitlines():
        if linea.startswith(f"{clave}="):
            return linea.split("=", 1)[1].strip()
    return "0.0"


def escribir_version(clave, version_nueva):
    lineas = ARCHIVO_VERSION.read_text().splitlines() if ARCHIVO_VERSION.exists() else []
    nuevas, encontrada = [], False
    for linea in lineas:
        if linea.startswith(f"{clave}="):
            nuevas.append(f"{clave}={version_nueva}")
            encontrada = True
        else:
            nuevas.append(linea)
    if not encontrada:
        nuevas.append(f"{clave}={version_nueva}")
    ARCHIVO_VERSION.write_text("\n".join(nuevas) + "\n")


def incrementar(version_actual, tipo):
    major, minor = (int(x) for x in version_actual.split("."))
    if tipo == "major":
        return f"{major + 1}.0"
    return f"{major}.{minor + 1}"


def correr(comando):
    print("$ " + " ".join(comando))
    if subprocess.run(comando, cwd=RAIZ).returncode != 0:
        sys.exit(1)


def main():
    argumentos = sys.argv[1:]
    target = argumentos[0] if len(argumentos) > 0 else None
    tipo = argumentos[1] if len(argumentos) > 1 else None

    if target not in OBJETIVOS:
        target = pedir("Qué querés publicar (backend/frontend): ", OBJETIVOS)
    if tipo not in TIPOS:
        tipo = pedir("Tipo de release (minor/major): ", TIPOS)

    datos = OBJETIVOS[target]
    version_nueva = incrementar(leer_version(datos["clave"]), tipo)
    escribir_version(datos["clave"], version_nueva)
    print(f"Nueva versión de {target}: {version_nueva}")

    imagen = datos["imagen"]
    correr([
        "docker", "build",
        "-f", datos["dockerfile"],
        "-t", f"{imagen}:{version_nueva}",
        "-t", f"{imagen}:latest",
        ".",
    ])
    correr(["docker", "push", f"{imagen}:{version_nueva}"])
    correr(["docker", "push", f"{imagen}:latest"])

    print()
    print("Publicado correctamente:")
    print(f"{imagen}:{version_nueva}")
    print(f"{imagen}:latest")


if __name__ == "__main__":
    main()
