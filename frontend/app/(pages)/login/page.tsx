"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LoginCard from "@componentes/LoginCard";

const MapView = dynamic(() => import("@componentes/MapView"), { ssr: false });

export default function Page() {
	const router = useRouter();

	function handleLogin(/*email, password*/) {
		/*console.log("Intentando login con:", email, password);*/

		// Acá en el futuro validás credenciales contra tu backend

		router.push("/inicio"); 
	}

	return (
		<main
			style={{
				position: "relative",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				padding: "24px",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					zIndex: 0,
					pointerEvents: "none",
				}}
			>
				<MapView />
			</div>

			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
            "linear-gradient(135deg, rgba(7,28,48,0.65) 0%, rgba(9,130,200,0.35) 100%)",
					backdropFilter: "blur(6px)",
					zIndex: 1,
				}}
			/>

			<div
				style={{
					position: "relative",
					zIndex: 2,
					width: "100%",
					maxWidth: 720,
				}}
			>
				<LoginCard onLogin={handleLogin} />
			</div>
		</main>
	);
}
