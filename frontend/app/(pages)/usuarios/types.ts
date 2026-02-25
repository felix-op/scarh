import { BackendError } from "@servicios/api/types";
import { AxiosError } from "axios";

export type TFormEditarUsuario = {
    first_name: string;
    last_name: string;
    nombre_usuario: string;
    legajo: string;
    email: string;
    estado: boolean;
}

export type TEditarUsuario = (data: TFormEditarUsuario) => void;

export type TFormCrearUsuario = {
    first_name: string;
    last_name: string;
    nombre_usuario: string;
    legajo: string;
    email: string;
    password1: string;
    password2: string;
}

export type TCrearUsuario = (data: TFormCrearUsuario) => void;

export type TError = AxiosError<BackendError> | null;