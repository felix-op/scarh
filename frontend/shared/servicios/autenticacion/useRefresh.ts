import { useCallback, useState } from "react";
import LoginResponse from "@tipos/LoginResponse";

type UseRefreshProps = {
	url: string;
}

export default function useRefresh({ url }: UseRefreshProps) {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<LoginResponse | null>(null);

	const refresh = useCallback(async (refreshToken: string) => {
		setLoading(true);
		const opciones: RequestInit = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refresh: refreshToken }),
		};
		
		try {
			const response = await fetch(url, opciones);
			const data: LoginResponse = await response.json();
			setData(data);
			return data;
		} catch (error: unknown) {
			console.error("Error al refrescar sesión:", error);
			setError(error as Error);
			return null;
		} finally {
			setLoading(false);
		}
	}, [url]);

	return { error, loading, data, refresh };
}
