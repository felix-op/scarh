#!/usr/bin/env bash
set -euo pipefail

IMAGE="felixop/scarh"
TYPE="${1:-}"

if [[ -n "$TYPE" && "$TYPE" != "minor" && "$TYPE" != "major" ]]; then
    echo "Tipo invalido: $TYPE (debe ser 'minor' o 'major')" >&2
    exit 1
fi

if [[ -z "$TYPE" ]]; then
    read -rp "Tipo de release (minor/major): " TYPE
    if [[ "$TYPE" != "minor" && "$TYPE" != "major" ]]; then
        echo "Tipo invalido: $TYPE (debe ser 'minor' o 'major')" >&2
        exit 1
    fi
fi

# Leer última versión desde un archivo VERSION
if [[ -f "VERSION" ]]; then
    LAST=$(cat VERSION)
else
    LAST="0.0"
fi

MAJOR="${LAST%%.*}"
MINOR="${LAST##*.}"

if [[ "$TYPE" == "major" ]]; then
    MAJOR=$((MAJOR + 1))
    MINOR=0
else
    MINOR=$((MINOR + 1))
fi

VERSION="$MAJOR.$MINOR"

echo "Nueva versión: $VERSION"

# Guardar nueva versión
echo -n "$VERSION" > VERSION

# Construir imagen
docker build \
    -f Dockerfile.production \
    -t "$IMAGE:$VERSION" \
    -t "$IMAGE:latest" .

# Subir tags
docker push "$IMAGE:$VERSION"
docker push "$IMAGE:latest"

echo ""
echo "Publicado correctamente:"
echo "$IMAGE:$VERSION"
echo "$IMAGE:latest"
