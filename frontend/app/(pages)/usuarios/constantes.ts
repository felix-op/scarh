import { VentanaAceptarOptions } from "@componentes/ventanas/VentanaAceptar";
import { TFormCrearUsuario, TFormEditarUsuario, TEntidadRoles } from "./types";

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
];

export const opcionesRoles: TEntidadRoles[] = [
	{
		entidad: "Administración",
		roles: [
			{
				label: "Acceso total",
				value: "administracion",
				help: "Permite acceso total a todas las funcionalidades de administración (incluye todos los permisos anteriores).",
				type: "editar",
			},
		],
	},
	{
		entidad: "Limnígrafos",
		roles: [
			{
				label: "Ver limnígrafos",
				value: "limnigrafos-visualizar",
				help: "Permite visualizar limnigrafos.",
				type: "ver",
			},
			{
				label: "Editar limnígrafos",
				value: "limnigrafos-editar",
				help: "Permite crear, editar y eliminar limnigrafos.",
				type: "editar",
			},
		],
	},
	{
		entidad: "Mediciones",
		roles: [
			{
				label: "Ver mediciones",
				value: "mediciones-visualizar",
				help: "Permite visualizar mediciones.",
				type: "ver",
			},
			{
				label: "Editar mediciones",
				value: "mediciones-editar",
				help: "Permite crear mediciones manuales.",
				type: "editar",
			},
		],
	},
	{
		entidad: "Usuarios",
		roles: [
			{
				label: "Ver usuarios",
				value: "usuarios-visualizar",
				help: "Permite visualizar usuarios.",
				type: "ver",
			},
			{
				label: "Editar usuarios",
				value: "usuarios-editar",
				help: "Permite crear, editar y eliminar usuarios.",
				type: "editar",
			},
		],
	},
	{
		entidad: "Historial",
		roles: [
			{
				label: "Ver historial",
				value: "historial-visualizar",
				help: "Permite visualizar historial de acciones.",
				type: "ver",
			},
		],
	},
	{
		entidad: "Ubicaciones",
		roles: [
			{
				label: "Ver ubicaciones",
				value: "ubicaciones-visualizar",
				help: "Permite visualizar ubicaciones.",
				type: "ver",
			},
			{
				label: "Editar ubicaciones",
				value: "ubicaciones-editar",
				help: "Permite crear, editar y eliminar ubicaciones.",
				type: "editar",
			},
		],
	},
	{
		entidad: "Mapa",
		roles: [
			{
				label: "Ver mapa",
				value: "mapa-visualizar",
				help: "Permite visualizar mapa.",
				type: "ver",
			},
			{
				label: "Editar mapa",
				value: "mapa-editar",
				help: "Permite editar configuraciones relacionadas al mapa.",
				type: "editar",
			},
		],
	},
	{
		entidad: "Estadísticas",
		roles: [
			{
				label: "Ver estadísticas",
				value: "estadisticas-visualizar",
				help: "Permite consultar estadisticas no persistidas.",
				type: "ver",
			},
		],
	},
];
