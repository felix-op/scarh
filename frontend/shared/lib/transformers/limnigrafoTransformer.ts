/**
 * TRANSFORMADOR DE DATOS: BACKEND → FRONTEND
 * 
 * Este archivo convierte los datos del backend Django al formato esperado
 * por los componentes del frontend. Mantiene la integridad visual del sistema
 * sin modificar los componentes existentes.
 */

import type { LimnigrafoResponse, MedicionResponse } from "@servicios/api/django.api";
import type { EstadoLimnigrafo } from "@componentes/BotonEstadoLimnigrafo";

/**
 * Convierte el estado del backend al formato del frontend
 * 
 * Backend: "normal" | "advertencia" | "critico"
 * Frontend: { variante: "activo" | "advertencia" | "fuera" | "prueba" }
 */
export function mapearEstado(estadoBackend: string): EstadoLimnigrafo {
	const mapeo: Record<string, EstadoLimnigrafo["variante"]> = {
		"normal": "activo",
		"advertencia": "advertencia",
		"critico": "fuera",
	};

	const variante = mapeo[estadoBackend] || "activo";
	return { variante };
}

/**
 * Formatea el nivel de batería como string
 * 
 * Entrada: 92.5 (número)
 * Salida: "Bateria 92%" (string)
 */
export function formatearBateria(nivelBateria: number | null): string {
	if (nivelBateria === null || nivelBateria === undefined) {
		return "Bateria N/A";
	}
	
	// Redondear a entero
	const nivel = Math.round(nivelBateria);
	return `Bateria ${nivel}%`;
}

/**
 * Calcula el tiempo transcurrido desde un timestamp
 * 
 * Entrada: "2025-12-04T18:45:30Z" (ISO 8601)
 * Salida: "Hace 15 minutos" (string)
 */
export function calcularTiempoUltimoDato(timestamp: string | null): string {
	if (!timestamp) {
		return "Sin datos";
	}

	try {
		const fecha = new Date(timestamp);
		const ahora = new Date();
		const diferenciaMs = ahora.getTime() - fecha.getTime();
		const diferenciaMinutos = Math.floor(diferenciaMs / 60000);

		if (diferenciaMinutos < 1) {
			return "Hace menos de 1 minuto";
		} else if (diferenciaMinutos === 1) {
			return "Hace 1 minuto";
		} else if (diferenciaMinutos < 60) {
			return `Hace ${diferenciaMinutos} minutos`;
		} else if (diferenciaMinutos < 120) {
			return "Hace 1 hora";
		} else if (diferenciaMinutos < 1440) {
			const horas = Math.floor(diferenciaMinutos / 60);
			return `Hace ${horas} horas`;
		} else {
			const dias = Math.floor(diferenciaMinutos / 1440);
			return dias === 1 ? "Hace 1 día" : `Hace ${dias} días`;
		}
	} catch (error) {
		console.error("Error calculando tiempo:", error);
		return "Sin datos";
	}
}

/**
 * Formatea un valor de medición con su unidad
 * 
 * Entrada: 24.5 → Salida: "24.5°"
 * Entrada: null → Salida: "N/A"
 */
export function formatearMedicion(valor: number | null, unidad: string): string {
	if (valor === null || valor === undefined) {
		return "N/A";
	}
	
	// Redondear a 1 decimal
	const valorRedondeado = Math.round(valor * 10) / 10;
	return `${valorRedondeado}${unidad}`;
}

/**
 * Combina datos de limnígrafo y su última medición
 * 
 * Esta función es el núcleo del transformador. Toma:
 * - Datos del limnígrafo (del endpoint /limnigrafos/)
 * - Última medición (del endpoint /medicion/?limnigrafo={id}&limit=1)
 * 
 * Y devuelve el formato exacto que esperan los componentes del frontend.
 */
export function transformarLimnigrafoConMedicion(
	limnigrafo: LimnigrafoResponse,
	ultimaMedicion?: MedicionResponse
) {
	// Construir timestamp completo desde ultima_conexion
	// El backend devuelve solo "HH:MM:SS", necesitamos agregar la fecha
	const fechaHoy = new Date().toISOString().split('T')[0]; // "2025-12-04"
	const timestampCompleto = limnigrafo.ultima_conexion 
		? `${fechaHoy}T${limnigrafo.ultima_conexion}Z`
		: null;

	return {
		// ID como string (frontend lo espera así)
		id: String(limnigrafo.id),
		
		// Nombre: combinar código + descripción
		nombre: limnigrafo.descripcion 
			? `${limnigrafo.codigo} - ${limnigrafo.descripcion}`
			: limnigrafo.codigo,
		
		// Ubicación: nombre de la ubicación
		ubicacion: limnigrafo.ubicacion?.nombre || "Sin ubicación",
		
		// Batería: formatear desde número a string
		bateria: formatearBateria(limnigrafo.bateria),
		
		// Tiempo del último dato: calcular desde última conexión
		tiempoUltimoDato: calcularTiempoUltimoDato(timestampCompleto),
		
		// Estado: mapear al formato del frontend
		estado: mapearEstado(limnigrafo.estado),
		
		// Datos de la última medición (si existe)
		temperatura: ultimaMedicion 
			? formatearMedicion(ultimaMedicion.temperatura, "°")
			: "N/A",
		
		altura: ultimaMedicion 
			? formatearMedicion(ultimaMedicion.altura, " mts")
			: "N/A",
		
		presion: ultimaMedicion 
			? formatearMedicion(ultimaMedicion.presion, " bar")
			: "N/A",
		
		// Datos adicionales (para página de detalle)
		ultimoMantenimiento: limnigrafo.ultimo_mantenimiento || "Sin información",
		descripcion: limnigrafo.descripcion || "Sin descripción",
		
		// Coordenadas (para el mapa)
		coordenadas: limnigrafo.ubicacion ? {
			lat: limnigrafo.ubicacion.latitud,
			lng: limnigrafo.ubicacion.longitud,
		} : undefined,
		
		// Datos extra (pueden agregarse más según necesidad)
		datosExtra: [
			{ label: "Código", value: limnigrafo.codigo },
			{ label: "Estado", value: limnigrafo.estado },
			{ label: "Batería máx", value: `${limnigrafo.bateria_max}%` },
			{ label: "Batería mín", value: `${limnigrafo.bateria_min}%` },
		],
	};
}

/**
 * Transforma un array de limnígrafos a formato frontend
 * 
 * Uso típico:
 * const limnigrafos = await fetchLimnigrafos();
 * const formatted = transformarLimnigrafos(limnigrafos);
 */
export function transformarLimnigrafos(
	limnigrafos: LimnigrafoResponse[],
	medicionesPorLimnigrafo?: Map<number, MedicionResponse>
) {
	return limnigrafos.map(limnigrafo => {
		const ultimaMedicion = medicionesPorLimnigrafo?.get(limnigrafo.id);
		return transformarLimnigrafoConMedicion(limnigrafo, ultimaMedicion);
	});
}
