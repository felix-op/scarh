import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";

export const defaultFormCrearLimnigrafo = {
	codigo: "",
	memoria: 0,
	tipo_de_comunicacion: [],
};

export const defaultMessage: VentanaAceptarOptions = {
	title: "",
	description: "",
	variant: "info",
};

export const opcionesTipoComunicacion = [
	{ label: "Internet 2G", value: "internet-https-2G" },
	{ label: "Internet 3G", value: "internet-https-3G" },
	{ label: "Internet 4G", value: "internet-https-4G" },
	{ label: "Internet 5G", value: "internet-https-5G" },
	{ label: "USB", value: "fisico-usb" },
	{ label: "Mensajes SMS", value: "mensajes-sms" },
	{ label: "Correos SMTP", value: "correos-smtp" },
];

export const opcionesEstado = [
	{ label: "Todos", value: "" },
	{ label: "Normal", value: "normal" },
	{ label: "Advertencia", value: "advertencia" },
	{ label: "Peligro", value: "peligro" },
	{ label: "Fuera", value: "fuera" },
];
