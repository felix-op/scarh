// ============================================================================
// MODELS.GO - DEFINICIÓN DE ESTRUCTURAS DE DATOS
// ============================================================================
// Este archivo define las estructuras de datos utilizadas en el simulador.
//
// PROPÓSITO:
//   - Definir el formato de las mediciones que se envían al backend
//   - Definir el estado interno de cada limnígrafo (batería, timestamp)
//
// ESTRUCTURAS PRINCIPALES:
//
//   Medicion: Representa una medición de un limnígrafo
//     - limnigrafo_id: ID del limnígrafo
//     - timestamp: Fecha y hora de la medición (RFC3339)
//     - altura: Nivel del agua en metros (obligatorio)
//     - temperatura: Temperatura en °C (opcional, puede ser nil)
//     - presion: Presión atmosférica en hPa (opcional, puede ser nil)
//     - nivel_de_bateria: Nivel de batería en % (opcional, puede ser nil)
//
//   LimnigrafoState: Estado interno del limnígrafo
//     - BateriaActual: Nivel actual de batería
//     - UltimaLectura: Timestamp de la última medición
//
// NOTAS:
//   - Los campos con *float64 son punteros para permitir valores nil
//   - nil simula fallas en sensores (datos faltantes)
//   - El backend acepta mediciones parciales (solo con altura)
//   - Los tags json:"..." definen cómo se serializa a JSON
//   - omitempty elimina campos nil del JSON enviado
// ============================================================================

package main

import "time"

type Medicion struct {
	FechaHora      time.Time `json:"fecha_hora"`
	Altura         float64   `json:"altura_agua"`
	Presion        *float64  `json:"presion,omitempty"`
	Temperatura    *float64  `json:"temperatura,omitempty"`
	NivelDeBateria *float64  `json:"nivel_de_bateria,omitempty"`
	LimnigrafoID   int       `json:"limnigrafo"`
}
