export type EstadoUsuario = "activo" | "inactivo";

export type UsuarioResponse = {
    id: number,
    nombre_usuario: string,
    legajo: string,
    email: string,
    first_name: string,
    last_name: string,
    estado: boolean,
    roles: string[],
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

export type UsuarioRolesPutRequest = {
    roles: string[];
}

export type UsuarioPatchRequest = {
    nombre_usuario?: string,
    legajo?: string,
    email?: string,
    first_name?: string,
    last_name?: string,
    estado?: boolean,
    contraseña?: string,
};
