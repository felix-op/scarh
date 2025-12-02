"use client";

import useLogin from "@servicios/autenticacion/useLogin";
import useRefresh from "@servicios/autenticacion/useRefresh";
import LoginCredentials from "@tipos/LoginCredentials";
import Usuario from "@tipos/Usuario";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type LoginProviderProps = {
    children: ReactNode;
};

type LoginContextType = {
	usuario: Usuario | null;
	token: string | null;
	loadingLogin: boolean;
    errorLogin: Error | null;
	loadingRefresh: boolean;
    errorRefresh: Error | null;
    onLogin: (credentials: LoginCredentials) => void;
    onLogout: () => void;
} | null;

const LoginContext = createContext<LoginContextType>(null);

export default function LoginProvider({ children }: LoginProviderProps) {
	const [usuario, setUsuario] = useState<Usuario | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [token, setToken] = useState<string | null>(null);
	
	const URL = process.env.NEXT_PUBLIC_API_URL;
	const { error: errorLogin, loading: loadingLogin, login } = useLogin({ url: `${URL}/auth/login/` });
	const { error: errorRefresh, loading: loadingRefresh, refresh } = useRefresh({ url: `${URL}/auth/refresh/` });

	useEffect(() => {
		if (!refreshToken) return;
		const timeOut = setInterval(async () => {
			const data = await refresh(refreshToken);
			if (data) {
				setToken(data.access);
			}
		},  5000);
		return () => clearInterval(timeOut);
	}, [refreshToken, refresh]);

	const onLogin = useCallback(async (credentials: LoginCredentials) => {
		const data = await login(credentials);
		if (data) {
			setUsuario(data.user);
			setToken(data.access);
			setRefreshToken(data.refresh);
		}
	}, [login]);

	const onLogout = useCallback(() => {
		setUsuario(null);
		setToken(null);
		setRefreshToken(null);
	}, []);

	const value = useMemo(() => ({
		usuario,
		token,
		loadingLogin,
		errorLogin,
		loadingRefresh,
		errorRefresh,
		onLogin,
		onLogout,
	}), [usuario, token, loadingLogin, errorLogin, loadingRefresh, errorRefresh, onLogin, onLogout]);

	return (
		<LoginContext.Provider value={value}>
			{children}
		</LoginContext.Provider>
	);
}

export const useLoginContext = () => {
	const context = useContext(LoginContext);
	if (!context) {
		throw new Error("useLogin must be used within a LoginProvider");
	}
	return context;
};
