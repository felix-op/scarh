// ============================================================================
// CLIENT.GO - CLIENTE HTTP PARA COMUNICACIÓN CON BACKEND
// ============================================================================
// Este archivo maneja toda la comunicacion HTTP con el backend de SCARH.
//
// PROPÓSITO:
//   - Enviar mediciones al endpoint /medicion/ del backend
//   - Autenticar usando JWT Tokens (header: Authorization: Bearer <token>)
//   - Manejar errores de red y respuestas HTTP
// ============================================================================

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SendMeasurement envía una medición al backend SCARH
func SendMeasurement(backendURL string, token string, m Medicion) error {
	// Construir URL completa
	url := backendURL + "medicion/"

	// Serializar medición a JSON
	jsonData, err := json.Marshal(m)
	if err != nil {
		return fmt.Errorf("error serializando medición a JSON: %w", err)
	}

	Debug(fmt.Sprintf("Enviando JSON: %s", string(jsonData)))

	// Crear request HTTP
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error creando request HTTP: %w", err)
	}

	// Agregar headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Enviar request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error enviando request: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("error leyendo respuesta: %w", err)
	}

	// Verificar status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("error HTTP %d: %s", resp.StatusCode, string(body))
	}

	Debug(fmt.Sprintf("Respuesta del servidor [%d]: %s", resp.StatusCode, string(body)))

	return nil
}
