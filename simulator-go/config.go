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
	"gopkg.in/yaml.v3"
	"os"
	"strings"
)

type Config struct {
	BackendURL         string             `yaml:"backend_url"`
	IntervalSeconds    int                `yaml:"interval_seconds"`
	IntervalMinMinutes float64            `yaml:"interval_minutes_min"`
	IntervalMaxMinutes float64            `yaml:"interval_minutes_max"`
	Limnigrafos        []LimnigrafoConfig `yaml:"limnigrafos"`
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
	BateriaInicial float64 `yaml:"bateria_inicial"`
	// Probabilidad de falla (0.0 = nunca falla, 1.0 = siempre falla)
	ProbabilidadFalla float64 `yaml:"probabilidad_falla"`
	// Duración de la falla en minutos (cuánto tiempo sin enviar datos)
	DuracionFallaMin int `yaml:"duracion_falla_min"`
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

	cfg.BackendURL = strings.TrimRight(strings.TrimSpace(cfg.BackendURL), "/")
	if cfg.BackendURL == "" {
		return nil, fmt.Errorf("backend_url es obligatorio")
	}

	// Compatibilidad:
	// 1) Config nueva: interval_minutes_min / interval_minutes_max
	// 2) Config vieja: interval_seconds
	if cfg.IntervalMinMinutes <= 0 && cfg.IntervalMaxMinutes <= 0 {
		if cfg.IntervalSeconds > 0 {
			fixedMinutes := float64(cfg.IntervalSeconds) / 60.0
			cfg.IntervalMinMinutes = fixedMinutes
			cfg.IntervalMaxMinutes = fixedMinutes
		} else {
			cfg.IntervalMinMinutes = 0.25 // 15 segundos
			cfg.IntervalMaxMinutes = 0.75 // 45 segundos
		}
	}

	if cfg.IntervalMinMinutes <= 0 {
		cfg.IntervalMinMinutes = cfg.IntervalMaxMinutes
	}
	if cfg.IntervalMaxMinutes <= 0 {
		cfg.IntervalMaxMinutes = cfg.IntervalMinMinutes
	}

	if cfg.IntervalMinMinutes <= 0 || cfg.IntervalMaxMinutes <= 0 {
		return nil, fmt.Errorf("interval_minutes_min e interval_minutes_max deben ser mayores a 0")
	}

	if cfg.IntervalMinMinutes > cfg.IntervalMaxMinutes {
		cfg.IntervalMinMinutes, cfg.IntervalMaxMinutes = cfg.IntervalMaxMinutes, cfg.IntervalMinMinutes
	}

	if len(cfg.Limnigrafos) == 0 {
		return nil, fmt.Errorf("debes definir al menos un limnigrafo")
	}

	for i := range cfg.Limnigrafos {
		l := &cfg.Limnigrafos[i]

		if l.ID == 0 {
			return nil, fmt.Errorf("limnigrafo con id 0 no es válido")
		}
		if l.Token == "" {
			return nil, fmt.Errorf("limnigrafo %d no tiene token", l.ID)
		}

		// Compatibilidad con configs antiguas que usan bateria_inicial.
		if l.BateriaMax <= 0 && l.BateriaInicial > 0 {
			l.BateriaMax = l.BateriaInicial
		}
		if l.BateriaMax <= 0 {
			l.BateriaMax = 100
		}
		if l.BateriaMin < 0 {
			return nil, fmt.Errorf("limnigrafo %d tiene bateria_min negativa", l.ID)
		}
		if l.BateriaMin > l.BateriaMax {
			return nil, fmt.Errorf(
				"limnigrafo %d tiene bateria_min (%.2f) mayor que bateria_max (%.2f)",
				l.ID, l.BateriaMin, l.BateriaMax,
			)
		}
	}

	return &cfg, nil
}
