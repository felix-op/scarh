"use client";

import LoginCredentials from "@tipos/LoginCredentials";
import { signIn } from 'next-auth/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormularioLogin from "./componentes/FormularioLogin";

export default function Page() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const onSubmit = async (credentials: LoginCredentials) => {
		setLoading(true);

		const result = await signIn('credentials', {
			username: credentials.username,
			password: credentials.password,
			redirect: false,
		});

		if (result?.error === 'CredentialsSignin') {
			setError(new Error('Usuario o contraseña incorrectos'));
		}

		if (result?.ok) {
			setError(null);
			router.push('/inicio');
		}

		setLoading(false);
	};

	return (
		<main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
			<div className="absolute inset-0 z-0 pointer-events-none">
				<Image
					src="/mapa-ushuaia.png"
					alt="Mapa de fondo"
					fill
					className="object-cover"
					priority
				/>
			</div>

			<div className="absolute inset-0 z-1 pointer-events-none backdrop-blur-sm bg-linear-to-br from-azul-marino-oscuro to-azul-marino" />

			<FormularioLogin onSubmit={onSubmit} loading={loading} error={error} />
		</main>
	);
}
