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
	"math/rand"
	"time"
)

// Estado interno del limnígrafo (actualmente sin uso, preparado para futuro)
type LimnigrafoState struct {
	BateriaActual float64
}

// GenerateMeasurement genera una medición aleatoria realista
func GenerateMeasurement(cfg LimnigrafoConfig, state *LimnigrafoState) Medicion {
	// Inicializar medición base con altura (siempre presente)
	altura := cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)
	medicion := Medicion{
		FechaHora:    time.Now().UTC(),
		Altura:       altura,
		LimnigrafoID: cfg.ID,
	}

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
