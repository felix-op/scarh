export type Ubicacion = {
    id: number
    longitud: number
    latitud: number
    nombre: string
}

export type EstadoLimnigrafo =
  | "normal"
  | "fuera"
  | "peligro"
  | "advertencia";

export type UltimaMedicionResponse = {
    id: number
    fecha_hora: string
    altura_agua: number | null
    temperatura: number | null
    presion: number | null
}

export type ConfiguracionLimnigrafoResponse = {
    id: number
    tiempo_advertencia: number | null
    tiempo_peligro: number | null
    bateria_min: number | null
    altura_minima_agua: number | null
    altura_maxima_agua: number | null
    temperatura_minima: number | null
    temperatura_maxima: number | null
    presion_minima: number | null
    presion_maxima: number | null
}

export type LimnigrafoResponse = {
    id: number
    codigo: string
    estado: EstadoLimnigrafo
    descripcion: string
    ultimo_mantenimiento: string // Fecha
    ultima_medicion: UltimaMedicionResponse | null
    tipo_comunicacion: string[]
    ultima_conexion: string
    bateria: number // Voltios
    memoria: number // Bytes
    radio_cobertura_metros: number | null
    ubicacion: Ubicacion
    configuracion: ConfiguracionLimnigrafoResponse | null
}

export type LimnigrafoPostRequest = {
    codigo: string
    memoria?: number | null // Bytes
    tipo_comunicacion?: string[] | null
    radio_cobertura_metros?: number | null
}

export type LimnigrafoPutRequest = {
    codigo?: string
    descripcion?: string
	ultimo_mantenimiento?: string | null; // Fecha
    tipo_comunicacion?: string[]
    memoria?: number // Bytes
    radio_cobertura_metros?: number | null
	ubicacion_id?: string | null;
}

export type LimnigrafoPatchtRequest = {
    codigo?: string
    descripcion?: string
    ultimo_mantenimiento?: string
    tipo_comunicacion?: string[]
    memoria?: number // Bytes
    radio_cobertura_metros?: number | null
    ubicacion_id?: string
}

export type ConfiguracionLimnigrafoUpdateRequest = {
    tiempo_advertencia?: number | null
    tiempo_peligro?: number | null
    bateria_min?: number | null
    altura_minima_agua?: number | null
    altura_maxima_agua?: number | null
    temperatura_minima?: number | null
    temperatura_maxima?: number | null
    presion_minima?: number | null
    presion_maxima?: number | null
}
