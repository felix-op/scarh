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
