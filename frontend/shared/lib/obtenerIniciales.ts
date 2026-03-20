export default function obtenerIniciales(nombre?: string, apellido?: string) {
	const primerNombre = nombre?.trim().charAt(0) ?? "";
	const primerApellido = apellido?.trim().charAt(0) ?? "";
	const initials = `${primerNombre}${primerApellido}`.trim();
	if (initials) return initials.toUpperCase();
	return "US";
}
