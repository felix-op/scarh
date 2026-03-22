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
    ultimo_mantenimiento: string
    ultima_medicion: string
    tipo_comunicacion: string[]
    tiempo_advertencia: string
    tiempo_peligro: string
    ultima_conexion: string
    bateria_max: number
    bateria_min: number
    bateria: number
    memoria: number
    ubicacion: Ubicacion
}

export type LimnigrafoPostRequest = {
    codigo: string
    memoria?: number | null
    tipo_comunicacion?: string[] | null
}

export type LimnigrafoPutRequest = {
    codigo?: string
    descripcion?: string
	ultimo_mantenimiento?: string | null;
    tipo_comunicacion?: string[]
    bateria_max?: number
    bateria_min?: number
    memoria?: number
	tiempo_advertencia?: string | null;
	tiempo_peligro?: string | null;
	ubicacion_id?: string | null;
}

export type LimnigrafoPatchtRequest = {
    codigo?: string
    descripcion?: string
    ultimo_mantenimiento?: string
    tipo_comunicacion?: string[]
    bateria_max?: number
    bateria_min?: number
    memoria?: number
    tiempo_advertencia?: string
    tiempo_peligro?: string
    ubicacion_id?: string
}
