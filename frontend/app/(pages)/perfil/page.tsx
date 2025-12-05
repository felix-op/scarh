"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import UserInfoCard from "@componentes/UserInfoCard";
import PaginaBase from "@componentes/base/PaginaBase";

const USUARIO_DEMO = {
	nombre: "Juan",
	apellido: "Perez",
	legajo: "12345678/123",
	email: "juanp123@gmail.com",
	telefono: "+5492901123456",
	password: "juancito123",
	estadoLabel: "Activo",
	estadoVariant: "activo" as const,
};

export default function ProfilePage() {
	function handleLogout() {
		// Mismo comportamiento que el botón rojo viejo:
		// cierra sesión con next-auth y redirige al home.
		signOut({
			callbackUrl: "/",
			redirect: true,
		});
	}

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB]">

				<main className="flex flex-1 flex-col items-stretch px-6 py-10">


					{/* Contenido principal: tarjeta de usuario centrada */}
					<div className="mt-6 flex flex-1 items-start justify-center">
						<UserInfoCard
							{...USUARIO_DEMO}
							showActions={false}
							showPassword={false}
							className="mx-auto"
						/>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
