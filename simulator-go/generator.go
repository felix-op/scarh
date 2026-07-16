// ============================================================================
// GENERATOR.GO - GENERADOR DE DATOS SIMULADOS
// ============================================================================
// Este archivo genera mediciones realistas para cada limnígrafo.
//
// LÓGICA CORRECTA:
//   - Altura: Valor aleatorio entre altura_min y altura_max (simula nivel de agua)
//   - Temperatura: Valor aleatorio dentro del rango configurado
//   - Presión: Valor aleatorio dentro del rango configurado  
//   - Batería: Valor aleatorio entre bateria_min y bateria_max (simula carga variable)
//   - Fallas: 10% de probabilidad de que falten algunos sensores
//
// ============================================================================

package main

import (
	"fmt"
	"math/rand"
	"time"
)

// Estado interno del limnígrafo (actualmente sin uso, preparado para futuro)
type LimnigrafoState struct {
	BateriaActual float64
	MeasurementsGenerated int
}

// GenerateMeasurement genera una medición aleatoria realista
func GenerateMeasurement(cfg LimnigrafoConfig, state *LimnigrafoState) Medicion {
	state.MeasurementsGenerated++

	if cfg.ForceAlerts {
		return generateAlertMeasurement(cfg, state)
	}

	// Inicializar medición base con altura (siempre presente)
	altura := cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)
	medicion := Medicion{
		FechaHora:    time.Now().UTC(),
		Altura:       altura,
		LimnigrafoID: cfg.ID,
	}
	medicion.IdempotencyKey = buildIdempotencyKey(cfg.ID, medicion.FechaHora)

	// Probabilidad de falla de sensores: 10%
	tieneError := rand.Float64() < 0.1

	if !tieneError {
		// ============ MEDICIÓN NORMAL: TODOS LOS SENSORES FUNCIONAN ============
		
		// Temperatura aleatoria dentro del rango
		temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
		medicion.Temperatura = &temperatura

		// Presión aleatoria dentro del rango
		presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
		medicion.Presion = &presion

		// Batería aleatoria entre min y max (simula carga variable)
		bateria := cfg.BateriaMin + rand.Float64()*(cfg.BateriaMax-cfg.BateriaMin)
		medicion.NivelDeBateria = &bateria

	} else {
		// ============ MEDICIÓN CON ERRORES: ALGUNOS SENSORES FALLAN ============
		
		// Decidir qué sensores fallan (puede ser uno o varios)
		falla := rand.Intn(3)
		
		switch falla {
		case 0:
			// Falla sensor de batería (temperatura y presión OK)
			temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
			medicion.Temperatura = &temperatura
			
			presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
			medicion.Presion = &presion
			// NivelDeBateria = nil

		case 1:
			// Falla sensor de temperatura (presión y batería OK)
			// Temperatura = nil
			
			presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
			medicion.Presion = &presion
			
			bateria := cfg.BateriaMin + rand.Float64()*(cfg.BateriaMax-cfg.BateriaMin)
			medicion.NivelDeBateria = &bateria

		case 2:
			// Falla sensor de presión (temperatura y batería OK)
			temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
			medicion.Temperatura = &temperatura
			// Presion = nil
			
			bateria := cfg.BateriaMin + rand.Float64()*(cfg.BateriaMax-cfg.BateriaMin)
			medicion.NivelDeBateria = &bateria
		}
	}

	return medicion
}

func generateAlertMeasurement(cfg LimnigrafoConfig, state *LimnigrafoState) Medicion {
	medicion := Medicion{
		FechaHora:    time.Now().UTC(),
		LimnigrafoID: cfg.ID,
	}
	medicion.IdempotencyKey = buildIdempotencyKey(cfg.ID, medicion.FechaHora)

	switch state.MeasurementsGenerated % 3 {
	case 1:
		medicion.Altura = cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)
		temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
		presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
		bateria := cfg.BateriaMin - 0.6
		medicion.Temperatura = &temperatura
		medicion.Presion = &presion
		medicion.NivelDeBateria = &bateria
	case 2:
		medicion.Altura = cfg.AlturaMax + 1.0
		temperatura := cfg.TemperaturaMax + 8.0
		presion := cfg.PresionMax + 35.0
		bateria := cfg.BateriaMax
		medicion.Temperatura = &temperatura
		medicion.Presion = &presion
		medicion.NivelDeBateria = &bateria
	default:
		medicion.Altura = cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)
		temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
		presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)
		medicion.Temperatura = &temperatura
		medicion.Presion = &presion
	}

	return medicion
}

func buildIdempotencyKey(limnigrafoID int, fechaHora time.Time) string {
	return fmt.Sprintf("lm-%d-%d", limnigrafoID, fechaHora.UTC().UnixNano())
}
