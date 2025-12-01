import Usuario from "./Usuario";

export default interface LoginResponse {
    refresh: string;
    access: string;
    user: Usuario;
}