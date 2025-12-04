// ============================================================================
// GENERATOR.GO - GENERADOR DE DATOS SIMULADOS
// ============================================================================
// Este archivo genera mediciones realistas para cada limnígrafo.
//
// PROPÓSITO:
//   - Simular sensores de altura, temperatura, presión y batería
//   - Generar valores aleatorios dentro de rangos configurados
//   - Simular fallas aleatorias (datos faltantes)
//   - Simular descarga gradual de batería
//
// LÓGICA DE SIMULACIÓN:
//   - Altura: Valor aleatorio entre altura_min y altura_max
//   - Temperatura: Valor aleatorio entre temperatura_min y temperatura_max
//   - Presión: Valor aleatorio entre presion_min y presion_max
//   - Batería: Descarga gradual de 0.1% - 0.5% por medición
//   - Fallas: 10% de probabilidad de datos faltantes (nil)
//
// [IMPORTANTE] PARÁMETROS CONFIGURABLES:
//   - Probabilidad de fallas: Línea 49 (errorProbability > 0.1)
//   - Descarga de batería: Línea 61 (state.BateriaActual -= 0.1)
//   - Intervalo de envío: config.yaml (interval_seconds)
//
// ============================================================================

package main

import (
	"math/rand"
	"time"
)

// Estado interno del limnígrafo para mantener batería
type LimnigrafoState struct {
	BateriaActual float64
}

// GenerateMeasurement genera una medición aleatoria basada en la configuración
func GenerateMeasurement(cfg LimnigrafoConfig, state *LimnigrafoState) Medicion {
	// Generar altura dentro del rango
	altura := cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)

	// Inicializar medición base
	medicion := Medicion{
		FechaHora:    time.Now().UTC(),
		Altura:       altura,
		LimnigrafoID: cfg.ID,
	}

	// [IMPORTANTE] CONFIGURACIÓN: Probabilidad de fallas (cambiar 0.1 para ajustar)
	// 0.1 = 10% de fallas | 0.05 = 5% | 0.2 = 20%
	errorProbability := rand.Float64()

	if errorProbability > 0.1 { // <- MODIFICAR AQUÍ para cambiar % de fallas
		// Medición normal con todos los valores

		// Generar temperatura
		temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
		medicion.Temperatura = &temperatura

		// Generar presión
		presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
		medicion.Presion = &presion

		// [IMPORTANTE] CONFIGURACIÓN: Descarga de batería por medición
		state.BateriaActual -= 0.1 // <- MODIFICAR AQUÍ (ej: 0.05 = descarga más lenta)
		if state.BateriaActual < cfg.BateriaMin {
			state.BateriaActual = cfg.BateriaMin
		}
		medicion.NivelDeBateria = &state.BateriaActual

	} else {
		// Simular error: algunos valores serán nulos
		errorType := rand.Intn(4)

		switch errorType {
		case 0:
			// Error: sensor de temperatura desconectado
			temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
			medicion.Temperatura = &temperatura

			presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
			medicion.Presion = &presion
			// bateria = nil

		case 1:
			// Error: sensor de presión desconectado
			temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
			medicion.Temperatura = &temperatura
			// presion = nil

			state.BateriaActual -= 0.1
			if state.BateriaActual < cfg.BateriaMin {
				state.BateriaActual = cfg.BateriaMin
			}
			medicion.NivelDeBateria = &state.BateriaActual

		case 2:
			// Error: múltiples sensores con falla
			// solo altura disponible

		case 3:
			// Error: valor de altura fuera de rango
			alturaError := cfg.AlturaMax + rand.Float64()*0.5
			medicion.Altura = alturaError

			temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
			medicion.Temperatura = &temperatura

			presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
			medicion.Presion = &presion

			state.BateriaActual -= 0.1
			if state.BateriaActual < cfg.BateriaMin {
				state.BateriaActual = cfg.BateriaMin
			}
			medicion.NivelDeBateria = &state.BateriaActual
		}
	}

	return medicion
}
