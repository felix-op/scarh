import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { MemoryUnit } from "@tipos/Memoria";
import { TFormEditarLimnigrafo } from "./types";

export const defaultFormEditarLimnigrafo: TFormEditarLimnigrafo = {
	codigo: "",
	descripcion: "",
	ultimo_mantenimiento: "",
	bateria_min: 0,
	bateria_max: 0,
	tiempo_advertencia_horas: null,
	tiempo_advertencia_minutos: null,
	tiempo_advertencia_segundos: null,
	tiempo_peligro_horas: null,
	tiempo_peligro_minutos: null,
	tiempo_peligro_segundos: null,
	memoria_value: null,
	memoria_unit: "MB",
	tipo_comunicacion: [],
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

export const opcionesMemoria = [
	{ label: "B", value: "B" },
	{ label: "KB", value: "KB" },
	{ label: "MB", value: "MB" },
	{ label: "GB", value: "GB" },
];

export const MEMORY_MAP: Record<MemoryUnit, number> = {
	B: 1,
	KB: 1024,
	MB: 1024 ** 2,
	GB: 1024 ** 3,
};
