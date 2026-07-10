// ============================================================================
// SETUP_TOKENS.GO - CONFIGURACIÓN AUTOMÁTICA DE TOKENS
// ============================================================================
// Este archivo automatiza la configuración inicial del simulador.
//
// NOTA: Este archivo NO se compila en el binario principal.
//       Se ejecuta por separado con: go run setup_tokens.go
//
// PROPÓSITO:
//   - Autenticar con el backend usando usuario/contraseña
//   - Obtener lista de todos los limnígrafos existentes
//   - Generar API Keys para cada limnígrafo automáticamente
//   - Crear config.yaml con toda la configuración necesaria
//
// FLUJO DE EJECUCIÓN:
//   1. Usuario ingresa credenciales (usuario, contraseña)
//   2. Script hace login JWT al backend
//   3. Obtiene lista de limnígrafos desde /limnigrafos/
//   4. Para cada limnígrafo, genera un API Key
//   5. Guarda todo en config.yaml
//   6. Hace backup de config.yaml existente si hay uno
//
// ENDPOINTS UTILIZADOS:
//   POST /usuarios/token/        - Login JWT
//   GET  /limnigrafos/           - Lista de limnígrafos
//   POST /limnigrafos/{id}/generate-key/ - Generar API Key
//
// AUTENTICACIÓN:
//   - Usa JWT (Bearer token) para autenticar las requests
//   - El token JWT se obtiene del endpoint /usuarios/token/
//   - Los API Keys generados se usan en el simulador principal
//
// EJECUCIÓN:
//   go run setup_tokens.go
//
// RESULTADO:
//   - Crea/actualiza config.yaml con todos los tokens
//   - Hace backup del config.yaml anterior (si existe)
//   - Muestra resumen de limnígrafos configurados
// ============================================================================

//go:build ignore
// +build ignore

package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

// Config structures (duplicadas aquí para que sea standalone)
type ConfigSetup struct {
	BackendURL         string                  `yaml:"backend_url"`
	IntervalMinMinutes float64                 `yaml:"interval_minutes_min"`
	IntervalMaxMinutes float64                 `yaml:"interval_minutes_max"`
	Limnigrafos        []LimnigrafoConfigSetup `yaml:"limnigrafos"`
}

type LimnigrafoConfigSetup struct {
	ID                 int     `yaml:"id"`
	Token              string  `yaml:"token"`
	AlturaMin          float64 `yaml:"altura_min"`
	AlturaMax          float64 `yaml:"altura_max"`
	TemperaturaMin     float64 `yaml:"temperatura_min"`
	TemperaturaMax     float64 `yaml:"temperatura_max"`
	PresionMin         float64 `yaml:"presion_min"`
	PresionMax         float64 `yaml:"presion_max"`
	BateriaMax         float64 `yaml:"bateria_max"`
	BateriaMin         float64 `yaml:"bateria_min"`
	IntervalMinMinutes float64 `yaml:"interval_minutes_min,omitempty"`
	IntervalMaxMinutes float64 `yaml:"interval_minutes_max,omitempty"`
	ProbabilidadFalla  float64 `yaml:"probabilidad_falla"`
	DuracionFallaMin   int     `yaml:"duracion_falla_min"`
	DuracionFallaMax   int     `yaml:"duracion_falla_max"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Access  string `json:"access"`
	Refresh string `json:"refresh"`
}

type LimnigrafoAPI struct {
	ID             int                      `json:"id"`
	Codigo         string                   `json:"codigo"`
	Descripcion    string                   `json:"descripcion"`
	Configuracion  *ConfiguracionLimnigrafo `json:"configuracion"`
	AlturaMin      float64                  `json:"altura_min"`
	AlturaMax      float64                  `json:"altura_max"`
	TemperaturaMin float64                  `json:"temperatura_min"`
	TemperaturaMax float64                  `json:"temperatura_max"`
	PresionMin     float64                  `json:"presion_min"`
	PresionMax     float64                  `json:"presion_max"`
	BateriaMax     float64                  `json:"bateria_max"`
	BateriaMin     float64                  `json:"bateria_min"`
}

type ConfiguracionLimnigrafo struct {
	BateriaMax        *float64 `json:"bateria_max"`
	BateriaMin        *float64 `json:"bateria_min"`
	AlturaMinimaAgua  *float64 `json:"altura_minima_agua"`
	AlturaMaximaAgua  *float64 `json:"altura_maxima_agua"`
	TemperaturaMinima *float64 `json:"temperatura_minima"`
	TemperaturaMaxima *float64 `json:"temperatura_maxima"`
	PresionMinima     *float64 `json:"presion_minima"`
	PresionMaxima     *float64 `json:"presion_maxima"`
}

type LimnigrafoPaginatedResponse struct {
	Results []LimnigrafoAPI `json:"results"`
}

type GenerateKeyResponse struct {
	Message      string `json:"message"`
	LimnigrafoID int    `json:"limnigrafo_id"`
	KeyName      string `json:"key_name"`
	KeyPrefix    string `json:"key_prefix"`
	SecretKey    string `json:"secret_key"`
	Warning      string `json:"warning"`
}

func main() {
	// Leer configuración
	fmt.Println("Setup automático de tokens para SCARH Simulator")
	fmt.Println("================================================\n")

	// Verificar si existe config.yaml y hacer backup
	if _, err := os.Stat("config.yaml"); err == nil {
		timestamp := time.Now().Format("20060102_150405")
		backupName := fmt.Sprintf("config.yaml.backup_%s", timestamp)

		fmt.Printf("[AVISO] Detectado config.yaml existente, creando backup: %s\n", backupName)

		data, err := os.ReadFile("config.yaml")
		if err == nil {
			os.WriteFile(backupName, data, 0644)
			fmt.Println("[OK] Backup creado\n")
		}
	}

	// Pedir credenciales
	var username, password, backendURL string

	fmt.Print("Ingrese la URL del backend (default: http://localhost:8000): ")
	fmt.Scanln(&backendURL)
	if backendURL == "" {
		backendURL = "http://localhost:8000"
	}
	backendURL = strings.TrimRight(strings.TrimSpace(backendURL), "/")

	fmt.Print("Ingrese su usuario: ")
	reader := bufio.NewReader(os.Stdin)
	username, _ = reader.ReadString('\n')
	username = strings.TrimSpace(username)

	fmt.Print("Ingrese su contraseña: ")
	passwordStr, _ := reader.ReadString('\n')
	password = strings.TrimSpace(passwordStr)

	fmt.Println("\n[INFO] Autenticando...")

	// Autenticar
	token, err := authenticate(backendURL, username, password)
	if err != nil {
		fmt.Printf("[ERROR] Error de autenticación: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("[OK] Autenticación exitosa\n")

	// Obtener limnígrafos
	fmt.Println("[INFO] Obteniendo limnígrafos del backend...")
	limnigrafos, err := getLimnigrafos(backendURL, token)
	if err != nil {
		fmt.Printf("[ERROR] Error obteniendo limnígrafos: %v\n", err)
		os.Exit(1)
	}

	if len(limnigrafos) == 0 {
		fmt.Println("[AVISO] No se encontraron limnígrafos en el backend")
		os.Exit(1)
	}

	fmt.Printf("[OK] Encontrados %d limnígrafos\n\n", len(limnigrafos))

	// Generar tokens para cada limnígrafo
	var configLimnigrafos []LimnigrafoConfigSetup

	for _, lmg := range limnigrafos {
		fmt.Printf("[INFO] Generando token para Limnígrafo #%d (%s)...\n", lmg.ID, lmg.Descripcion)

		keyResponse, err := generateKey(backendURL, token, lmg.ID)
		if err != nil {
			fmt.Printf("   [AVISO] Error generando token: %v\n", err)
			continue
		}

		probabilidadFalla, duracionFallaMin, duracionFallaMax, intervaloMin, intervaloMax := defaultFailureProfile(lmg.ID)
		configLmg := LimnigrafoConfigSetup{
			ID:                 lmg.ID,
			Token:              keyResponse.SecretKey,
			AlturaMin:          lmg.alturaMin(),
			AlturaMax:          lmg.alturaMax(),
			TemperaturaMin:     lmg.temperaturaMin(),
			TemperaturaMax:     lmg.temperaturaMax(),
			PresionMin:         lmg.presionMin(),
			PresionMax:         lmg.presionMax(),
			BateriaMax:         lmg.bateriaMax(),
			BateriaMin:         lmg.bateriaMin(),
			IntervalMinMinutes: intervaloMin,
			IntervalMaxMinutes: intervaloMax,
			ProbabilidadFalla:  probabilidadFalla,
			DuracionFallaMin:   duracionFallaMin,
			DuracionFallaMax:   duracionFallaMax,
		}

		configLimnigrafos = append(configLimnigrafos, configLmg)
		fmt.Printf("   [OK] Token generado: %s...\n\n", keyResponse.SecretKey[:20])
	}

	// Crear nueva configuración
	config := ConfigSetup{
		BackendURL:         backendURL,
		IntervalMinMinutes: 2, // 2 minutos
		IntervalMaxMinutes: 3, // 3 minutos
		Limnigrafos:        configLimnigrafos,
	}

	// Guardar config.yaml
	fmt.Println("[INFO] Guardando configuración en config.yaml...")
	err = saveConfig(config, "config.yaml")
	if err != nil {
		fmt.Printf("[ERROR] Error guardando configuración: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("[OK] Configuración guardada exitosamente")
	fmt.Println("\n[INFO] Setup completado! Ahora puedes ejecutar el simulador con:")
	fmt.Println("   go run .")
}

func authenticate(backendURL, username, password string) (string, error) {
	loginReq := LoginRequest{
		Username: username,
		Password: password,
	}

	jsonData, err := json.Marshal(loginReq)
	if err != nil {
		return "", err
	}

	url := backendURL + "/auth/login/"
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	var loginResp LoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return "", err
	}

	return loginResp.Access, nil
}

func getLimnigrafos(backendURL, token string) ([]LimnigrafoAPI, error) {
	url := backendURL + "/limnigrafos/"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var direct []LimnigrafoAPI
	if err := json.Unmarshal(body, &direct); err == nil && len(direct) > 0 {
		return direct, nil
	}

	var paginated LimnigrafoPaginatedResponse
	if err := json.Unmarshal(body, &paginated); err == nil && len(paginated.Results) > 0 {
		return paginated.Results, nil
	}

	return nil, fmt.Errorf("respuesta de limnigrafos no reconocida: %s", string(body))
}

func generateKey(backendURL, token string, limnigrafoID int) (*GenerateKeyResponse, error) {
	url := fmt.Sprintf("%s/limnigrafos/%d/generate_key/", backendURL, limnigrafoID)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	var keyResp GenerateKeyResponse
	if err := json.NewDecoder(resp.Body).Decode(&keyResp); err != nil {
		return nil, err
	}

	return &keyResp, nil
}

func saveConfig(config ConfigSetup, filename string) error {
	data, err := yaml.Marshal(&config)
	if err != nil {
		return err
	}

	return os.WriteFile(filename, data, 0644)
}

func getOrDefault(value, defaultValue float64) float64 {
	if value == 0 {
		return defaultValue
	}
	return value
}

func getPointerOrDefault(value *float64, defaultValue float64) float64 {
	if value == nil {
		return defaultValue
	}
	return *value
}

func (l LimnigrafoAPI) alturaMin() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.AlturaMinimaAgua, 0.5)
	}
	return getOrDefault(l.AlturaMin, 0.5)
}

func (l LimnigrafoAPI) alturaMax() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.AlturaMaximaAgua, 3.5)
	}
	return getOrDefault(l.AlturaMax, 3.5)
}

func (l LimnigrafoAPI) temperaturaMin() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.TemperaturaMinima, -5)
	}
	return getOrDefault(l.TemperaturaMin, -5)
}

func (l LimnigrafoAPI) temperaturaMax() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.TemperaturaMaxima, 25)
	}
	return getOrDefault(l.TemperaturaMax, 25)
}

func (l LimnigrafoAPI) presionMin() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.PresionMinima, 950)
	}
	return getOrDefault(l.PresionMin, 950)
}

func (l LimnigrafoAPI) presionMax() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.PresionMaxima, 1050)
	}
	return getOrDefault(l.PresionMax, 1050)
}

func (l LimnigrafoAPI) bateriaMin() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.BateriaMin, 10)
	}
	return getOrDefault(l.BateriaMin, 10)
}

func (l LimnigrafoAPI) bateriaMax() float64 {
	if l.Configuracion != nil {
		return getPointerOrDefault(l.Configuracion.BateriaMax, 100)
	}
	return getOrDefault(l.BateriaMax, 100)
}

func defaultFailureProfile(limnigrafoID int) (
	probabilidad float64,
	duracionMin int,
	duracionMax int,
	intervaloMin float64,
	intervaloMax float64,
) {
	// Perfil base para que los equipos estén normalmente activos,
	// pero con cortes aleatorios de distinta severidad.
	switch limnigrafoID % 4 {
	case 1:
		return 0.012, 15, 60, 0.0, 0.0
	case 2:
		return 0.006, 8, 25, 0.0, 0.0
	case 3:
		return 0.003, 20, 180, 0.35, 0.60
	default:
		return 0.008, 10, 30, 0.30, 0.50
	}
}
