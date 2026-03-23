export type Ubicacion = {
    id: number
    longitud: number
    latitud: number
    nombre: string
}

export type EstadoLimnigrafo =
  | "normal"
  | "prueba"
  | "fuera"
  | "peligro"
  | "advertencia";

export type LimnigrafoResponse = {
    id: number
    codigo: string
    estado: EstadoLimnigrafo
    descripcion: string
    ultimo_mantenimiento: string // Fecha
    ultima_medicion: string // Fecha
    tipo_comunicacion: string[]
    tiempo_advertencia: number | null // Segundos
    tiempo_peligro: number | null // Segundos
    ultima_conexion: string
    bateria_max: number // Voltios
    bateria_min: number // Voltios
    bateria: number // Voltios
    memoria: number // Bytes
    ubicacion: Ubicacion
}

export type LimnigrafoPostRequest = {
    codigo: string
    memoria?: number | null // Bytes
    tipo_comunicacion?: string[] | null
}

export type LimnigrafoPutRequest = {
    codigo?: string
    descripcion?: string
	ultimo_mantenimiento?: string | null; // Fecha
    tipo_comunicacion?: string[]
    bateria_max?: number // Voltios
    bateria_min?: number // Voltios
    memoria?: number // Bytes
	tiempo_advertencia?: number | null; // Segundos
	tiempo_peligro?: number | null; // Segundos
	ubicacion_id?: string | null;
}

export type LimnigrafoPatchtRequest = {
    codigo?: string
    descripcion?: string
    ultimo_mantenimiento?: string
    tipo_comunicacion?: string[]
    bateria_max?: number
    bateria_min?: number
    memoria?: number // Bytes
    tiempo_advertencia?: number
    tiempo_peligro?: number
    ubicacion_id?: string
}
