"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginCard from "@componentes/LoginCard";

export default function Page() {
	const router = useRouter();

	function handleLogin(/*email, password*/) {
		/*console.log("Intentando login con:", email, password);*/

		// Acá en el futuro validás credenciales contra tu backend

		router.push("/inicio"); 
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

			<div className="relative z-2 w-full max-w-[720px]">
				<LoginCard onLogin={handleLogin} />
			</div>
		</main>
	);
}
