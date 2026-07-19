import type { Usuario } from "./models.usuarios";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Usuario;
  access_token_lifetime: number;
  refresh_token_lifetime: number;
}

export interface RefreshPayload {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
  refresh: string;
  access_token_lifetime: number;
  refresh_token_lifetime: number;
}
