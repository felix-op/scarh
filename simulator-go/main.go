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
	Info(fmt.Sprintf(
		"Intervalo: %.2f a %.2f minutos (%.0f a %.0f segundos)",
		cfg.IntervalMinMinutes,
		cfg.IntervalMaxMinutes,
		cfg.IntervalMinMinutes*60,
		cfg.IntervalMaxMinutes*60,
	))
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
	state := LimnigrafoState{}
	enFalla := false
	tiempoFinFalla := time.Now()
	intervaloMin, intervaloMax, usaIntervaloPropio := resolverIntervalos(cfg, globalCfg)
	origenIntervalo := "global+variacion"
	if usaIntervaloPropio {
		origenIntervalo = "por_limnigrafo"
	}
	duracionFallaInfo := fmt.Sprintf("%dmin", cfg.DuracionFallaMin)
	if cfg.DuracionFallaMax > cfg.DuracionFallaMin {
		duracionFallaInfo = fmt.Sprintf("%d-%dmin", cfg.DuracionFallaMin, cfg.DuracionFallaMax)
	}

	Info(fmt.Sprintf(
		"Limnígrafo #%d iniciado (intervalo[%s]: %.2f-%.2f min, prob. falla: %.3f%%, duración: %s)",
		cfg.ID, origenIntervalo, intervaloMin, intervaloMax, cfg.ProbabilidadFalla*100, duracionFallaInfo,
	))

	// Desfase inicial para evitar que todos reporten al mismo tiempo.
	desfaseInicial := randomInterval(0, intervaloMax)
	if desfaseInicial > 0 {
		Info(fmt.Sprintf("Limnígrafo #%d - Desfase inicial: %s", cfg.ID, desfaseInicial.Round(time.Second)))
		time.Sleep(desfaseInicial)
	}

	for {
		wait := randomInterval(intervaloMin, intervaloMax)
		time.Sleep(wait)

		// Verificar si está en periodo de falla
		if enFalla {
			if time.Now().Before(tiempoFinFalla) {
				Warning(fmt.Sprintf("Limnígrafo #%d - En falla, no enviando datos (termina en %s)",
					cfg.ID, time.Until(tiempoFinFalla).Round(time.Second)))
				continue
			}
			// Fin de la falla
			enFalla = false
			Success(fmt.Sprintf("Limnígrafo #%d - Recuperado de falla, reanudando envíos", cfg.ID))
		}

		// Probabilidad de entrar en falla
		if !enFalla && rand.Float64() < cfg.ProbabilidadFalla {
			enFalla = true
			duracionMinutos := randomInt(cfg.DuracionFallaMin, cfg.DuracionFallaMax)
			duracion := time.Duration(duracionMinutos) * time.Minute
			tiempoFinFalla = time.Now().Add(duracion)
			Warning(fmt.Sprintf("Limnígrafo #%d - INICIANDO FALLA por %d minutos", cfg.ID, duracionMinutos))
			continue
		}

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
				msg += fmt.Sprintf("│  Batería:     %6.2f V                                  │\n", *medicion.NivelDeBateria)
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

func randomInterval(minMinutes, maxMinutes float64) time.Duration {
	if maxMinutes <= minMinutes {
		return time.Duration(minMinutes * float64(time.Minute))
	}

	randomMinutes := minMinutes + rand.Float64()*(maxMinutes-minMinutes)
	return time.Duration(randomMinutes * float64(time.Minute))
}

func randomInt(min, max int) int {
	if max <= min {
		return min
	}
	return min + rand.Intn(max-min+1)
}

func resolverIntervalos(cfg LimnigrafoConfig, globalCfg *Config) (float64, float64, bool) {
	if cfg.IntervalMinMinutes > 0 || cfg.IntervalMaxMinutes > 0 {
		return cfg.IntervalMinMinutes, cfg.IntervalMaxMinutes, true
	}

	// Si usa intervalo global, aplicar una variación por limnígrafo para desincronizar.
	variacion := 0.8 + rand.Float64()*0.5 // [0.8, 1.3)
	min := globalCfg.IntervalMinMinutes * variacion
	max := globalCfg.IntervalMaxMinutes * variacion

	if min <= 0 {
		min = globalCfg.IntervalMinMinutes
	}
	if max <= 0 {
		max = globalCfg.IntervalMaxMinutes
	}
	if min > max {
		min, max = max, min
	}
	return min, max, false
}

// previewToken muestra una vista previa del token (primeros 3 y últimos 3 caracteres)
func previewToken(token string) string {
	if len(token) <= 6 {
		return token
	}
	return token[:3] + "..." + token[len(token)-3:]
}
