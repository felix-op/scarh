"use server";

import axios from "axios";

const SOLICITAR_URL = `${process.env.API_URL}/auth/recuperar-password/solicitar`;

export default async function solicitarRecuperacion(email: string) {
	try {
		const response = await axios.post(SOLICITAR_URL, { email });
		return response.data;
	} catch (error) {
		console.error("Error al solicitar recuperación:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.descripcion_tecnica || "Ocurrió un error al enviar el correo.");
		}
		throw new Error("No se pudo procesar la solicitud en el servidor.");
	}
}
