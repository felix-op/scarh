export function formatearHora(fecha: Date): string {
	return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function formatearDiaMes(fecha: Date): string {
	return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}
