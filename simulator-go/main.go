package main

import (
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"
)

func main() {
	// Inicializar seed aleatorio
	rand.Seed(time.Now().UnixNano())

	configPath := "config.yaml"

	cfg, err := LoadConfig(configPath)
	if err != nil {
		log.Fatalf("error al cargar config: %v", err)
	}

	fmt.Println("Configuración cargada correctamente")
	fmt.Printf("Backend URL: %s\n", cfg.BackendURL)
	fmt.Printf("Intervalo: %d segundos\n", cfg.IntervalSeconds)
	fmt.Printf("Limnígrafos configurados: %d\n", len(cfg.Limnigrafos))

	for _, l := range cfg.Limnigrafos {
		fmt.Printf("- ID=%d (token=%s...)\n", l.ID, previewToken(l.Token))
	}

	fmt.Println("\nIniciando simulación...")

	// Crear cliente HTTP
	client := NewClient(cfg.BackendURL)

	// WaitGroup para esperar todas las goroutines
	var wg sync.WaitGroup

	// Lanzar goroutine por cada limnígrafo
	for _, limnigrafo := range cfg.Limnigrafos {
		wg.Add(1)
		go runLimnigrafo(&wg, limnigrafo, cfg.IntervalSeconds, client)
	}

	// Esperar todas las goroutines (nunca termina)
	wg.Wait()
}

func runLimnigrafo(wg *sync.WaitGroup, cfg LimnigrafoConfig, intervalSeconds int, client *Client) {
	defer wg.Done()

	// Inicializar estado del limnígrafo
	state := LimnigrafoState{
		BateriaActual: cfg.BateriaInicial,
	}

	ticker := time.NewTicker(time.Duration(intervalSeconds) * time.Second)
	defer ticker.Stop()

	fmt.Printf("Limnígrafo #%d iniciado\n", cfg.ID)

	for range ticker.C {
		// Generar medición
		medicion := GenerateMedicion(cfg, &state)

		// Enviar medición
		err := client.SendMeasurement(medicion, cfg.Token)
		if err != nil {
			log.Printf("[ERROR] [Limnígrafo #%d] Error al enviar: %v", cfg.ID, err)
		} else {
			status := "[OK]"
			if medicion.Error != "" {
				status = "[WARN]"
			}
			fmt.Printf("%s [Limnígrafo #%d] Altura: %.2fm, Temp: %.1f°C, Presión: %.0fhPa, Batería: %.1f%%",
				status, cfg.ID, medicion.Altura, medicion.Temperatura, medicion.Presion, medicion.Bateria)
			if medicion.Error != "" {
				fmt.Printf(" [Error: %s]", medicion.Error)
			}
			fmt.Println()
		}
	}
}

func previewToken(token string) string {
	if len(token) <= 6 {
		return token
	}
	return token[:3] + "..." + token[len(token)-3:]
}
