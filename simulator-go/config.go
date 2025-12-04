// ============================================================================
// CONFIG.GO - CARGA Y PARSEO DE CONFIGURACIÓN
// ============================================================================
// Este archivo maneja la lectura del archivo config.yaml.
//
// PROPÓSITO:
//   - Leer config.yaml desde el disco
//   - Parsear YAML a estructuras Go
//   - Validar que la configuración sea válida
//
//   LimnigrafoConfig: Configuración de un limnígrafo
//     - id: ID del limnígrafo en la base de datos
//     - token: API Key para autenticación
//     - altura_min/max: Rangos para sensor de altura
//     - temperatura_min/max: Rangos para sensor de temperatura
//     - presion_min/max: Rangos para sensor de presión
//     - bateria_inicial: Nivel inicial de batería (%)
//     - bateria_min: Nivel mínimo antes de resetear
//
// NOTAS:
//   - config.yaml se genera automáticamente con setup_tokens.go
//   - No editar config.yaml manualmente, usar setup_tokens.go
// ============================================================================

package main

import (
	"fmt"
	"os"
	"gopkg.in/yaml.v3"
)

type Config struct {
	BackendURL      string             `yaml:"backend_url"`
	IntervalSeconds int                `yaml:"interval_seconds"`
	Limnigrafos     []LimnigrafoConfig `yaml:"limnigrafos"`
}

type LimnigrafoConfig struct {
	ID             int     `yaml:"id"`
	Token          string  `yaml:"token"`
	AlturaMin      float64 `yaml:"altura_min"`
	AlturaMax      float64 `yaml:"altura_max"`
	TemperaturaMin float64 `yaml:"temperatura_min"`
	TemperaturaMax float64 `yaml:"temperatura_max"`
	PresionMin     float64 `yaml:"presion_min"`
	PresionMax     float64 `yaml:"presion_max"`
	BateriaMin     float64 `yaml:"bateria_min"`
	BateriaMax     float64 `yaml:"bateria_max"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("error leyendo config.yaml: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("error parseando YAML: %w", err)
	}

	if cfg.BackendURL == "" {
		return nil, fmt.Errorf("backend_url es obligatorio")
	}

	if cfg.IntervalSeconds <= 0 {
		cfg.IntervalSeconds = 5
	}

	if len(cfg.Limnigrafos) == 0 {
		return nil, fmt.Errorf("debes definir al menos un limnigrafo")
	}

	for _, l := range cfg.Limnigrafos {
		if l.ID == 0 {
			return nil, fmt.Errorf("limnigrafo con id 0 no es válido")
		}
		if l.Token == "" {
			return nil, fmt.Errorf("limnigrafo %d no tiene token", l.ID)
		}
	}

	return &cfg, nil
}
