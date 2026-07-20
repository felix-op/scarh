#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"
TYPE="${2:-}"

if [[ -n "$TARGET" && "$TARGET" != "backend" && "$TARGET" != "frontend" ]]; then
    echo "Target invalido: $TARGET (debe ser 'backend' o 'frontend')" >&2
    exit 1
fi

if [[ -z "$TARGET" ]]; then
    read -rp "Que queres publicar (backend/frontend): " TARGET
    if [[ "$TARGET" != "backend" && "$TARGET" != "frontend" ]]; then
        echo "Target invalido: $TARGET (debe ser 'backend' o 'frontend')" >&2
        exit 1
    fi
fi

if [[ "$TARGET" == "backend" ]]; then
    IMAGE="felixop/scarh"
    KEY="BACKEND"
    DOCKERFILE="Dockerfile.api.production"
else
    IMAGE="felixop/scarh-frontend"
    KEY="FRONTEND"
    DOCKERFILE="Dockerfile.web.production"
fi

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

# Normalizar el archivo VERSION a saltos de línea Unix (evita \r si se edito en Windows)
if [[ -f "VERSION" ]]; then
    sed -i 's/\r$//' VERSION
fi

# Leer última versión de $KEY desde VERSION (archivo compartido entre backend y frontend)
LAST=""
if [[ -f "VERSION" ]]; then
    LAST=$(grep "^$KEY=" VERSION | cut -d'=' -f2 || true)
fi
LAST="${LAST:-0.0}"

MAJOR="${LAST%%.*}"
MINOR="${LAST##*.}"

if [[ "$TYPE" == "major" ]]; then
    MAJOR=$((MAJOR + 1))
    MINOR=0
else
    MINOR=$((MINOR + 1))
fi

VERSION="$MAJOR.$MINOR"

echo "Nueva versión de $TARGET: $VERSION"

# Guardar nueva versión solo en la línea de $KEY, sin tocar la otra
touch VERSION
if grep -q "^$KEY=" VERSION; then
    sed -i "s/^$KEY=.*/$KEY=$VERSION/" VERSION
else
    echo "$KEY=$VERSION" >> VERSION
fi

# Construir imagen
docker build \
    -f "$DOCKERFILE" \
    -t "$IMAGE:$VERSION" \
    -t "$IMAGE:latest" .

# Subir tags
docker push "$IMAGE:$VERSION"
docker push "$IMAGE:latest"

echo ""
echo "Publicado correctamente:"
echo "$IMAGE:$VERSION"
echo "$IMAGE:latest"