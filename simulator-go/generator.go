package main

import (
	"math/rand"
	"time"
)

type Medicion struct {
	LimnigrafoID int       `json:"limnigrafo_id"`
	Altura       float64   `json:"altura"`
	Temperatura  float64   `json:"temperatura"`
	Presion      float64   `json:"presion"`
	Bateria      float64   `json:"bateria"`
	Timestamp    time.Time `json:"timestamp"`
	Error        string    `json:"error,omitempty"`
}

type LimnigrafoState struct {
	BateriaActual float64
}

func GenerateMedicion(cfg LimnigrafoConfig, state *LimnigrafoState) Medicion {
	// Generar valores aleatorios dentro de los rangos
	altura := cfg.AlturaMin + rand.Float64()*(cfg.AlturaMax-cfg.AlturaMin)
	temperatura := cfg.TemperaturaMin + rand.Float64()*(cfg.TemperaturaMax-cfg.TemperaturaMin)
	presion := cfg.PresionMin + rand.Float64()*(cfg.PresionMax-cfg.PresionMin)

	// Decrementar batería (0.1% por medición)
	state.BateriaActual -= 0.1
	if state.BateriaActual < cfg.BateriaMin {
		state.BateriaActual = cfg.BateriaMin
	}

	medicion := Medicion{
		LimnigrafoID: cfg.ID,
		Altura:       altura,
		Temperatura:  temperatura,
		Presion:      presion,
		Bateria:      state.BateriaActual,
		Timestamp:    time.Now(),
	}

	// Generar error aleatorio (5% probabilidad)
	if rand.Float64() < 0.05 {
		errores := []string{
			"sensor_desconectado",
			"lectura_fuera_de_rango",
			"bateria_baja",
			"timeout_comunicacion",
		}
		medicion.Error = errores[rand.Intn(len(errores))]
	}

	return medicion
}
