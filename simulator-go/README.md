# SCARH Simulator

Simulador de limnígrafos en Go para el Sistema de Control y Alertas de Recursos Hidricos (SCARH).

## Características

- Simulación realista de sensores (altura, temperatura, presión, batería)
- Ejecución concurrente de múltiples limnígrafos
- Generación automática de tokens API
- Integración con Docker Compose
- Sistema de logging estructurado
- No interfiere con dispositivos reales

## Requisitos

- Go 1.20 o superior
- Backend SCARH en ejecución
- Acceso a base de datos con limnígrafos configurados

## Inicio Rápido

### Configuración Inicial

```bash
# Generar tokens automáticamente
go run setup_tokens.go

# Ingresar credenciales del backend cuando se solicite
# Usuario: admin
# Contraseña: ****
```

### Ejecución con Docker (Recomendado)

```bash
# Iniciar todo el sistema SCARH
docker-compose up -d

# Ver logs del simulador
docker-compose logs -f simulator

# Detener sistema
docker-compose down
```

### Ejecución Local

```bash
# Desarrollo
go run .

# Producción
go build -o simulator
./simulator
```

## Configuración

El archivo `config.yaml` se genera automáticamente con `setup_tokens.go`:

```yaml
backend_url: http://localhost:8000/
interval_seconds: 5

limnigrafos:
  - id: 1
    token: "API_TOKEN_HERE"
    altura_min: 0.5
    altura_max: 5.0
    temperatura_min: 15.0
    temperatura_max: 25.0
    presion_min: 980.0
    presion_max: 1020.0
    bateria_inicial: 100.0
    bateria_min: 10.0
```

**No editar manualmente.** Regenerar con `go run setup_tokens.go` si es necesario.

## Arquitectura

```
main.go         → Orquestación y goroutines
config.go       → Gestión de configuración
generator.go    → Generación de datos simulados
client.go       → Cliente HTTP para backend
models.go       → Estructuras de datos
logger.go       → Sistema de logging
setup_tokens.go → Configuración automática (standalone)
```

### Flujo de Ejecución

1. Carga `config.yaml`
2. Crea una goroutine por limnígrafo
3. Cada goroutine genera y envía mediciones en intervalos configurados
4. Logs estructurados con prefijos `[INFO]`, `[SUCCESS]`, `[ERROR]`

## Logging

Sistema de **Bracketed Prefix Logging**:

```
[INFO]    - Información general
[SUCCESS] - Operación exitosa
[ERROR]   - Error crítico
[WARNING] - Advertencia
[DEBUG]   - Depuración
```

Filtrar logs:
```bash
# Solo errores
docker-compose logs simulator | grep ERROR

# Limnígrafo específico
docker-compose logs simulator | grep "Limnígrafo #2"
```

## Simulación de Datos

- **Altura**: Valores aleatorios dentro del rango configurado
- **Temperatura/Presión**: Generación realista con variaciones naturales
- **Batería**: Descarga gradual (0.1%-0.5% por medición)
- **Fallas**: 5% probabilidad de datos null (simula sensores defectuosos)

## Troubleshooting

### Error: "no such file or directory: config.yaml"
```bash
go run setup_tokens.go
```

### Error: "401 Unauthorized"
Tokens inválidos. Regenerar:
```bash
go run setup_tokens.go
```

### Error: "connection refused"
Verificar que el backend esté corriendo:
```bash
docker ps | grep backend
```

### Error: "404 Not Found"
Verificar URL en `config.yaml` (debe terminar en `/`):
```yaml
backend_url: http://localhost:8000/
```

## Seguridad

- `config.yaml` contiene tokens sensibles (excluido de git)
- No commitear tokens al repositorio
- Regenerar tokens si se comprometen
- Autenticación JWT para setup
- API Keys para envío de mediciones

## Desarrollo

```bash
# Descargar dependencias
go mod download

# Limpiar módulos
go mod tidy

# Compilar para Linux
GOOS=linux GOARCH=amd64 go build -o simulator

# Verificar código
go vet ./...
go fmt ./...
```

## Estructura del Proyecto

```
simulator-go/
├── main.go              # Punto de entrada
├── config.go            # Configuración
├── models.go            # Estructuras de datos
├── generator.go         # Generación de datos
├── client.go            # Cliente HTTP
├── logger.go            # Sistema de logging
├── setup_tokens.go      # Setup automático
├── config.yaml          # Configuración (generado)
├── Dockerfile           # Imagen Docker
├── go.mod               # Dependencias
└── README.md            # Este archivo
```

---

**Documentación completa y soporte:** Ver wiki del proyecto SCARH
