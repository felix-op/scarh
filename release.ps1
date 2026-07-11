param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("minor", "major")]
    [string]$Type
)

$IMAGE = "felixop/scarh"

if (-not $Type) {
    $Type = Read-Host "Tipo de release (minor/major)"
}

# Leer última versión desde un archivo VERSION
if (Test-Path "VERSION") {
    $LAST = Get-Content "VERSION"
}
else {
    $LAST = "0.0"
}

$PARTS = $LAST.Split(".")
$MAJOR = [int]$PARTS[0]
$MINOR = [int]$PARTS[1]

if ($Type -eq "major") {
    $MAJOR++
    $MINOR = 0
}
else {
    $MINOR++
}

$VERSION = "$MAJOR.$MINOR"

Write-Host "Nueva versión: $VERSION"

# Guardar nueva versión
Set-Content -Path "VERSION" -Value $VERSION

# Construir imagen
docker build `
    -f Dockerfile.production `
    -t "$IMAGE`:$VERSION" `
    -t "$IMAGE`:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error construyendo imagen"
    exit 1
}

# Subir tags
docker push "$IMAGE`:$VERSION"
docker push "$IMAGE`:latest"

Write-Host ""
Write-Host "Publicado correctamente:"
Write-Host "$IMAGE`:$VERSION"
Write-Host "$IMAGE`:latest"