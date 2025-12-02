# Simulador SCARH - Limnígrafos

Simulador de limnígrafos IoT desarrollado en Go para el proyecto SCARH. Genera y envía mediciones simuladas al backend del sistema.

## Características

- Simulación de múltiples limnígrafos simultáneos
- Generación de datos realistas: altura, temperatura, presión y batería
- Degradación automática de batería (0.1% por medición)
- Simulación de errores aleatorios (5% probabilidad)
- Autenticación mediante API Keys
- Concurrencia con goroutines
- Envío de datos al backend vía REST API

## Requisitos

- Go 1.21 o superior
- Backend SCARH ejecutándose
- API Keys válidas para cada limnígrafo

## Instalación

```bash
# Clonar o navegar al directorio
cd simulator-go

# Inicializar módulo Go
go mod init scarh-simulator

# Instalar dependencias
go get gopkg.in/yaml.v3
go mod download
```

## Configuración

1. Copiar archivo de ejemplo:
```bash
cp config.yaml.example config.yaml
```

2. Editar `config.yaml` con tus valores:

```yaml
backend_url: "http://localhost:8000/api/"
interval_seconds: 5

limnigrafos:
  - id: 1
    token: "LMG_TU_API_KEY_ACA"
    altura_min: 0.5
    altura_max: 3.5
    temperatura_min: -5
    temperatura_max: 25
    presion_min: 950
    presion_max: 1050
    bateria_inicial: 100
    bateria_min: 10
```

### Parámetros de configuración:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `backend_url` | URL del backend SCARH | `http://localhost:8000/api/` |
| `interval_seconds` | Segundos entre mediciones | `5` |
| `limnigrafos[].id` | ID único del limnígrafo | `1` |
| `limnigrafos[].token` | API Key para autenticación | `LMG_ABC123...` |
| `limnigrafos[].altura_min/max` | Rango de altura del agua (metros) | `0.5` - `3.5` |
| `limnigrafos[].temperatura_min/max` | Rango de temperatura (°C) | `-5` - `25` |
| `limnigrafos[].presion_min/max` | Rango de presión (hPa) | `950` - `1050` |
| `limnigrafos[].bateria_inicial` | Batería inicial (%) | `100` |
| `limnigrafos[].bateria_min` | Batería mínima (%) | `10` |

## Uso

```bash
# Ejecutar simulador
go run .

# O compilar y ejecutar
go build -o simulator
./simulator
```

## Estructura del Proyecto

```
simulator-go/
├── go.mod              # Dependencias del módulo
├── main.go             # Punto de entrada y coordinación
├── config.go           # Carga y validación de configuración
├── generator.go        # Generación de mediciones simuladas
├── client.go           # Cliente HTTP para envío de datos
├── models.go           # Estructuras de datos
├── config.yaml         # Configuración activa (no incluir en git)
├── config.yaml.example # Ejemplo de configuración
└── README.md           # Esta documentación
```

## Ejemplo de Salida

```
Configuración cargada correctamente
Backend URL: http://localhost:8000/api/
Intervalo: 5 segundos
Limnígrafos configurados: 2
- ID=1 (token=LMG...ACA)
- ID=2 (token=LMG...KEY)

Iniciando simulación...
Limnígrafo #1 iniciado
Limnígrafo #2 iniciado
[Limnígrafo #1] Altura: 2.34m, Temp: 18.5°C, Presión: 1013hPa, Batería: 99.9%
[Limnígrafo #2] Altura: 2.89m, Temp: 12.3°C, Presión: 998hPa, Batería: 89.9%
[Limnígrafo #1] Altura: 2.41m, Temp: 19.2°C, Presión: 1015hPa, Batería: 99.8% [Error: sensor_desconectado]
```

## Formato de Medición

Cada medición enviada al backend tiene el siguiente formato JSON:

```json
{
  "limnigrafo_id": 1,
  "altura": 2.34,
  "temperatura": 18.5,
  "presion": 1013.24,
  "bateria": 99.9,
  "timestamp": "2024-01-15T14:30:00Z",
  "error": "sensor_desconectado"
}
```

## Tipos de Errores Simulados

El simulador puede generar los siguientes errores aleatorios (5% probabilidad):

- `sensor_desconectado`: Pérdida de conexión con el sensor
- `lectura_fuera_de_rango`: Valor medido fuera de rango esperado
- `bateria_baja`: Advertencia de batería baja
- `timeout_comunicacion`: Timeout en comunicación

## Autenticación

El simulador envía las mediciones con el header:
```
Authorization: Api-Key LMG_TU_TOKEN_AQUI
```

Asegúrate de que los tokens en `config.yaml` sean válidos y estén registrados en el backend.

## Solución de Problemas

### Error: "no se pudo leer config.yaml"
- Verifica que existe el archivo `config.yaml` en el directorio
- Copia desde `config.yaml.example` si no existe

### Error: "backend_url es obligatorio"
- Asegúrate de definir `backend_url` en `config.yaml`

### Error HTTP 401 Unauthorized
- Verifica que los tokens sean correctos
- Confirma que los limnígrafos estén registrados en el backend

### Error HTTP 404 Not Found
- Verifica que la URL del backend sea correcta
- Asegúrate de que el backend esté ejecutándose

## Notas

- El simulador ejecuta una goroutine por cada limnígrafo configurado
- Las mediciones se envían de forma concurrente
- La batería se degrada gradualmente hasta el mínimo configurado
- Los errores se generan aleatoriamente para simular condiciones reales

## Licencia

MIT
