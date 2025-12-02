package main

import "time"

type LimnigrafoReading struct {
	LimnigrafoID int       `json:"limnigrafo_id"`
	Altura       float64   `json:"altura"`
	Temperatura  float64   `json:"temperatura"`
	Presion      float64   `json:"presion"`
	Bateria      float64   `json:"bateria"`
	Timestamp    time.Time `json:"timestamp"`
}

type SimulationStatus struct {
	IsRunning    bool      `json:"is_running"`
	StartTime    time.Time `json:"start_time"`
	ElapsedTime  string    `json:"elapsed_time"`
	ReadingsSent int       `json:"readings_sent"`
}
