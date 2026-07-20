param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "frontend")]
    [string]$Target,
 
    [Parameter(Mandatory=$false)]
    [ValidateSet("minor", "major")]
    [string]$Type
)
 
if (-not $Target) {
    $Target = Read-Host "Que queres publicar (backend/frontend)"
    if ($Target -ne "backend" -and $Target -ne "frontend") {
        Write-Host "Target invalido: $Target (debe ser 'backend' o 'frontend')"
        exit 1
    }
}
 
if ($Target -eq "backend") {
    $IMAGE = "felixop/scarh"
    $KEY = "BACKEND"
    $DOCKERFILE = "Dockerfile.api.production"
}
else {
    $IMAGE = "felixop/scarh-frontend"
    $KEY = "FRONTEND"
    $DOCKERFILE = "Dockerfile.web.production"
}
 
if (-not $Type) {
    $Type = Read-Host "Tipo de release (minor/major)"
}
 
# Leer última versión de $KEY desde VERSION (archivo compartido entre backend y frontend)
$lines = @()
if (Test-Path "VERSION") {
    $lines = Get-Content "VERSION"
}
 
$LAST = "0.0"
foreach ($line in $lines) {
    if ($line -match "^$KEY=(.+)$") {
        $LAST = $Matches[1]
    }
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
 
Write-Host "Nueva versión de $Target : $VERSION"
 
# Guardar nueva versión solo en la línea de $KEY, sin tocar la otra
$found = $false
$newLines = foreach ($line in $lines) {
    if ($line -match "^$KEY=") {
        $found = $true
        "$KEY=$VERSION"
    }
    else {
        $line
    }
}
if (-not $found) {
    $newLines += "$KEY=$VERSION"
}
Set-Content -Path "VERSION" -Value $newLines
 
# Construir imagen
docker build `
    -f $DOCKERFILE `
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