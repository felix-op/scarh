import Image from "next/image";
import FlujoRecuperacion from "./componentes/FlujoRecuperacion";

export default function Page() {
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

			<FlujoRecuperacion />
		</main>
	);
}
