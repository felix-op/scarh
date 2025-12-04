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

## Autenticación con Tokens

### ¿Cómo funciona?

El simulador utiliza **tokens API únicos** generados por el backend para autenticar cada limnígrafo:

1. **Backend genera tokens**: Cada limnígrafo tiene un token único (como una contraseña)
2. **Script obtiene tokens**: `setup_tokens.go` se conecta al backend y solicita tokens
3. **Simulador usa tokens**: Lee `config.yaml` y envía mediciones con `Authorization: Api-Key <token>`
4. **Backend valida**: Solo acepta mediciones con tokens válidos

### ¿Por qué no está en Git?

**🔒 Seguridad:** `config.yaml` contiene tokens secretos y **NUNCA debe subirse a GitHub**.

**📝 Solución:** Cada desarrollador ejecuta `setup_tokens.go` en su máquina local para generar su propio `config.yaml`:

```bash
go run setup_tokens.go
# Ingresar URL del backend: http://localhost:8000
# Ingresar usuario: admin
# Ingresar contraseña: ****
```

Este comando:
- Se conecta al backend con tus credenciales
- Obtiene lista de limnígrafos desde `/limnigrafos/`
- Genera un token API único para cada uno
- Guarda todo en `config.yaml` (archivo local, NO en Git)

### Estructura de `config.yaml`

Archivo generado automáticamente (ejemplo):

```yaml
backend_url: http://localhost:8000/
interval_seconds: 5

limnigrafos:
  - id: 1
    token: "p1Zt8cyH.YSSrMa2GhpHGKMku2tJNGjKiEAl6BChj"
    altura_min: 0.5
    altura_max: 5.0
    temperatura_min: 15.0
    temperatura_max: 25.0
    presion_min: 980.0
    presion_max: 1020.0
    bateria_inicial: 100.0
    bateria_min: 10.0
```

**⚠️ IMPORTANTE:**
- **NO editar manualmente** este archivo
- **NO commitear** a Git (ya está en `.gitignore`)
- **Regenerar** con `go run setup_tokens.go` si los tokens expiran o se corrompen

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

### Gestión de Tokens

**🔐 Tokens son secretos:** `config.yaml` contiene tokens API que funcionan como contraseñas.

**❌ NO hacer:**
- ~~Commitear `config.yaml` a Git~~
- ~~Compartir tokens por Slack/email~~
- ~~Hardcodear tokens en el código~~

**✅ SÍ hacer:**
- Cada desarrollador ejecuta `go run setup_tokens.go` localmente
- Tokens permanecen en tu máquina (archivo ignorado por Git)
- Regenerar tokens si se comprometen con `/limnigrafos/{id}/generate_key/`

### Autenticación en Endpoints

- **Setup (`setup_tokens.go`)**: Usa JWT (Bearer token) con credenciales de usuario
- **Simulador (`main.go`)**: Usa API Keys con header `Authorization: Api-Key <token>`
- **Backend valida**: Permisos configurados en `api/permissions.py`

### Rotación de Tokens

Si un token se compromete:

```bash
# Opción 1: Regenerar todos los tokens
go run setup_tokens.go

# Opción 2: Regenerar manualmente desde backend
curl -X POST http://localhost:8000/limnigrafos/1/generate_key/ \
  -H "Authorization: Bearer <jwt_token>"
```

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
