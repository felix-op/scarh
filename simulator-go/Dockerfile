# ============================================================================
# Dockerfile para Simulador SCARH
# ============================================================================
# Este Dockerfile crea una imagen Docker para ejecutar el simulador.
# El simulador se inicia automáticamente cuando se levanta el stack SCARH.
# ============================================================================

# Etapa 1: Compilación
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fuente
COPY *.go ./

# Compilar binario estático
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o simulator .

# Etapa 2: Imagen final mínima
FROM alpine:latest

# Instalar certificados SSL para HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copiar binario compilado
COPY --from=builder /app/simulator .

# Copiar configuración (debe existir config.yaml)
COPY config.yaml .

# Ejecutar simulador
CMD ["./simulator"]
