export const DEFAULT_VALIDATIONS = {
	email: {
		value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
		message: "Formato de correo electrónico inválido"
	},
	number: {
		value: /^[0-9]+$/,
		message: "Solo se permiten números"
	}
};
