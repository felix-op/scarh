import LoginCredentials from "@tipos/LoginCredentials";
import LoginResponse from "@tipos/LoginResponse";
import { useCallback, useState } from "react";

type UseLoginProps = {
	url: string;
}

export default function useLogin({ url }: UseLoginProps) {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<LoginResponse | null>(null);

	const login = useCallback(async (credentials: LoginCredentials) => {
		setLoading(true);
		const opciones: RequestInit = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		};
		
		try {
			const response = await fetch(url, opciones);
			const data: LoginResponse = await response.json();
			setData(data);
			return data;
		} catch (error: unknown) {
			console.error("Error al iniciar sesión:", error);
			setError(error as Error);
			return null;
		} finally {
			setLoading(false);
		}
	}, [url]);

	return { error, loading, data, login };
}
