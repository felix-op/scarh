import Usuario from "./Usuario";

export default interface LoginResponse {
	refresh: string;
	access: string;
	user: Usuario;
	access_token_lifetime: number;
	refresh_token_lifetime: number;
}
