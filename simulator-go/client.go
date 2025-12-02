package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) SendMeasurement(medicion Medicion, token string) error {
	// Convertir medición a JSON
	jsonData, err := json.Marshal(medicion)
	if err != nil {
		return fmt.Errorf("error al serializar medición: %w", err)
	}

	// Crear request
	url := c.BaseURL + "medicion/"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("error al crear request: %w", err)
	}

	// Agregar headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Api-Key "+token)

	// Enviar request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("error al enviar request: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, _ := io.ReadAll(resp.Body)

	// Verificar status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("error HTTP %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
