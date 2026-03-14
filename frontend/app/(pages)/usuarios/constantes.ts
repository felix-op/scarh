import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { TFormCrearUsuario, TFormEditarUsuario } from "./types";

export const defaultFormCrearUsuario: TFormCrearUsuario = {
	first_name: "",
	last_name: "",
	nombre_usuario: "",
	legajo: "",
	email: "",
	password1: "",
	password2: "",
};

export const defaultFormEditarUsuario: TFormEditarUsuario = {
	first_name: "",
	last_name: "",
	nombre_usuario: "",
	legajo: "",
	email: "",
	estado: true,
};

export const defaultMessage: VentanaAceptarOptions = {
	title: "",
	description: "",
	variant: "info",
};

export const opcionesEstado = [
	{ label: "Todos", value: "" },
	{ label: "Activo", value: "true" },
	{ label: "Inactivo", value: "false" },
]