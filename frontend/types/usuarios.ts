export type EstadoUsuario = "activo" | "inactivo" | "pendiente" | "suspendido";

export type UsuarioResponse = {
    id: number,
    nombre_usuario: string,
    legajo: string,
    email: string,
    first_name: string,
    last_name: string,
    estado: boolean,
};

export type UsuarioPostRequest = {
    nombre_usuario: string,
    legajo: string,
    email: string,
    first_name: string,
    last_name: string,
    estado: boolean,
    contraseña: string,
};

export type UsuarioPutRequest = {
    nombre_usuario: string,
    legajo: string,
    email: string,
    first_name: string,
    last_name: string,
    estado: boolean,
};

export type UsuarioPatchRequest = {
    nombre_usuario?: string,
    legajo?: string,
    email?: string,
    first_name?: string,
    last_name?: string,
    estado?: boolean,
    contraseña?: string,
};
