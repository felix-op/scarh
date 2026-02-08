"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import ProfileCard from "@componentes/navbar/ProfileCard";
import PaginaBase from "@componentes/base/PaginaBase";

export default function ProfilePage() {
	const router = useRouter();
	const { data: session } = useSession();

	const handleLogout = () => {
		signOut({
			callbackUrl: "/auth/login",
			redirect: true,
		});
	};

	const handleChangePassword = () => {
		router.push("/perfil/cambiar-contrasena");
	};

	const userData = {
		username: session?.user?.username ?? session?.user?.email ?? "Usuario",
		firstName: (session?.user as { first_name?: string } | undefined)?.first_name,
		lastName: (session?.user as { last_name?: string } | undefined)?.last_name,
		email: session?.user?.email,
		legajo: (session?.user as { id?: string } | undefined)?.id,
		avatarUrl: session?.user?.image,
		statusLabel: "Activo",
		statusVariant: "activo" as const,
	};

	return (
		<PaginaBase>
			<div className="flex min-h-screen w-full bg-[#EEF4FB] dark:bg-[rgb(35,39,47)]">

				<main className="flex flex-1 flex-col items-stretch px-4 sm:px-6 py-8 sm:py-10">


					{/* Contenido principal: tarjeta de usuario centrada */}
					<div className="mt-4 flex flex-1 items-start justify-center">
						<ProfileCard
							variant="detail"
							{...userData}
							onChangePassword={handleChangePassword}
							onLogout={handleLogout}
						/>
					</div>
				</main>
			</div>
		</PaginaBase>
	);
}
