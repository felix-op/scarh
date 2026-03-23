export const DEFAULT_VALIDATIONS = {
	email: {
		value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
		message: "Formato de correo electrónico inválido",
	},
	integer: {
		value: /^[0-9]+$/, // solo dígitos, sin signos ni puntos
		message: "Solo se permiten números enteros",
	},
	number: {
		value: /^[0-9]+(\.[0-9]+)?$/,
		message: "Número inválido, puede ser decimal"
	}
};
