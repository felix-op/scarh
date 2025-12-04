// ============================================================================
// LOGGER.GO - SISTEMA DE LOGGING CON PREFIJOS
// ============================================================================
// Este archivo implementa el sistema de logging "Bracketed Prefix Logging".
//
// PROPÓSITO:
//   - Proporcionar funciones de logging consistentes
//   - Agregar timestamps automáticos a cada mensaje
//   - Usar prefijos entre corchetes para identificar niveles de log
//
// FUNCIONES DISPONIBLES:
//   - Info(msg):    [INFO]    Información general del sistema
//   - Success(msg): [SUCCESS] Operación completada exitosamente
//   - Error(msg):   [ERROR]   Error crítico que requiere atención
//   - Warning(msg): [WARNING] Advertencia que no detiene la ejecución
//   - Debug(msg):   [DEBUG]   Información de depuración (JSON, HTTP)
//
// FORMATO DE SALIDA:
//   [YYYY-MM-DD HH:MM:SS] [NIVEL] Mensaje
//
//   Ejemplo:
//   [2024-12-03 21:45:30] [INFO] Iniciando simulador
//   [2024-12-03 21:45:35] [SUCCESS] Medición enviada correctamente
//   [2024-12-03 21:45:40] [ERROR] No se pudo conectar al backend
// ============================================================================

package main

import (
	"fmt"
	"time"
)

// Info imprime un mensaje informativo
func Info(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] [INFO] %s\n", timestamp, msg)
}

// Error imprime un mensaje de error
func Error(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] [ERROR] %s\n", timestamp, msg)
}

// Debug imprime un mensaje de depuración
func Debug(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] [DEBUG] %s\n", timestamp, msg)
}

// Success imprime un mensaje de éxito
func Success(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] [SUCCESS] %s\n", timestamp, msg)
}

// Warning imprime un mensaje de advertencia
func Warning(msg string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] [WARNING] %s\n", timestamp, msg)
}
