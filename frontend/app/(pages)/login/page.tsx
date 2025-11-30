"use client";

import { redirect } from "next/navigation";
import Image from "next/image";
import FormularioLogin from "./componentes/FormularioLogin";
import { useLoginContext } from "@componentes/providers/LoginProvider";

export default function Page() {
	const { usuario, onLogin, loadingLogin, errorLogin } = useLoginContext();

	if (usuario) {
		redirect("/inicio");
	}

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

			<FormularioLogin onSubmit={onLogin} loading={loadingLogin} error={errorLogin} />
		</main>
	);
}
