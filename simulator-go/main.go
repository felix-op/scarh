// ============================================================================
// SIMULADOR SCARH - ARCHIVO PRINCIPAL
// ============================================================================
// Este es el punto de entrada del simulador de limnígrafos.
//
// FLUJO:
//   1. Lee config.yaml con la lista de limnígrafos y sus tokens
//   2. Lanza una goroutine por limnígrafo (ejecución concurrente)
//   3. Cada goroutine genera y envía mediciones periódicamente
//   4. El programa corre indefinidamente hasta que se detenga manualmente
//
// ARCHIVOS RELACIONADOS:
//   - config.go: Carga y parsea config.yaml
//   - generator.go: Genera datos simulados realistas
//   - client.go: Envía las mediciones al backend vía HTTP
//   - logger.go: Sistema de logging con prefijos [INFO], [ERROR], etc.
// ============================================================================

package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

func main() {
	// Inicializar generador de números aleatorios
	rand.Seed(time.Now().UnixNano())

	Info("Iniciando Simulador SCARH - Limnígrafos")

	// Cargar configuración desde YAML
	configPath := "config.yaml"
	cfg, err := LoadConfig(configPath)
	if err != nil {
		Error(fmt.Sprintf("Error cargando configuración: %v", err))
		return
	}

	Success("Configuración cargada correctamente")
	Info(fmt.Sprintf("Backend URL: %s", cfg.BackendURL))
	Info(fmt.Sprintf("Intervalo: %d segundos", cfg.IntervalSeconds))
	Info(fmt.Sprintf("Limnígrafos configurados: %d", len(cfg.Limnigrafos)))

	// Mostrar información de cada limnígrafo
	for _, l := range cfg.Limnigrafos {
		Info(fmt.Sprintf("Limnígrafo ID=%d (token=%s...)", l.ID, previewToken(l.Token)))
	}

	Info("Iniciando simulación...")

	// WaitGroup para mantener el programa corriendo
	var wg sync.WaitGroup

	// Lanzar una goroutine por cada limnígrafo
	for _, limnigrafo := range cfg.Limnigrafos {
		wg.Add(1)
		go runLimnigrafo(&wg, limnigrafo, cfg)
	}

	// Esperar indefinidamente (las goroutines nunca terminan)
	wg.Wait()
}

// runLimnigrafo ejecuta el loop de simulación para un limnígrafo específico
func runLimnigrafo(wg *sync.WaitGroup, cfg LimnigrafoConfig, globalCfg *Config) {
	defer wg.Done()

	// Inicializar estado del limnígrafo
	state := LimnigrafoState{
		BateriaActual: cfg.BateriaInicial,
	}

	Info(fmt.Sprintf("Limnígrafo #%d iniciado", cfg.ID))

	// Ticker para generar mediciones periódicamente
	ticker := time.NewTicker(time.Duration(globalCfg.IntervalSeconds) * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Generar medición
			medicion := GenerateMeasurement(cfg, &state)

			// Enviar medición al backend
			err := SendMeasurement(globalCfg.BackendURL, cfg.Token, medicion)

			if err != nil {
				Error(fmt.Sprintf("Limnígrafo #%d - Error al enviar medición: %v", cfg.ID, err))
			} else {
				// Construir mensaje de log formateado
				msg := fmt.Sprintf("\n┌─────────────────────────────────────────────────────────┐\n")
				msg += fmt.Sprintf("│ Limnígrafo #%-2d                                         │\n", cfg.ID)
				msg += fmt.Sprintf("├─────────────────────────────────────────────────────────┤\n")
				msg += fmt.Sprintf("│  Altura:      %6.2f m                                 │\n", medicion.Altura)
				
				if medicion.Temperatura != nil {
					msg += fmt.Sprintf("│  Temperatura: %6.1f °C                                │\n", *medicion.Temperatura)
				} else {
					msg += fmt.Sprintf("│  Temperatura:    N/A                                   │\n")
				}

				if medicion.Presion != nil {
					msg += fmt.Sprintf("│  Presión:     %6.0f hPa                               │\n", *medicion.Presion)
				} else {
					msg += fmt.Sprintf("│  Presión:        N/A                                   │\n")
				}

				if medicion.NivelDeBateria != nil {
					msg += fmt.Sprintf("│  Batería:     %6.1f %%                                 │\n", *medicion.NivelDeBateria)
				} else {
					msg += fmt.Sprintf("│  Batería:        N/A                                   │\n")
				}
				
				msg += fmt.Sprintf("└─────────────────────────────────────────────────────────┘")

				// Verificar si hay valores faltantes (error simulado)
				if medicion.Temperatura == nil || medicion.Presion == nil || medicion.NivelDeBateria == nil {
					Warning(msg + " [MEDICIÓN CON ERRORES]")
				} else {
					Success(msg)
				}
			}
		}
	}
}

// previewToken muestra una vista previa del token (primeros 3 y últimos 3 caracteres)
func previewToken(token string) string {
	if len(token) <= 6 {
		return token
	}
	return token[:3] + "..." + token[len(token)-3:]
}
