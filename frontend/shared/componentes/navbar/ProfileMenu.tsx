"use client";
import Icon from "@componentes/icons/Icon";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import ProfileImage from "./ProfileImage";
import obtenerIniciales from "@lib/obtenerIniciales";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@componentes/components/ui/menubar";
import { useRouter } from "next/navigation";
import VentanaNotificaciones from "../alertas/VentanaNotificaciones";
import { useNotificaciones } from "@componentes/providers/NotificacionesProvider";

type HeaderProps = {
	isCollapsed: boolean
}

export default function ProfileMenu({ isCollapsed }: HeaderProps) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = useSession();
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const userName = session?.user.username || "No disponible";
	const iniciales = obtenerIniciales(session?.user.first_name, session?.user.last_name);
	const {
		notificaciones,
		noLeidas,
		notificarTemporal,
		marcarNotificacionLeida,
		marcarTodasComoLeidas,
	} = useNotificaciones();

	const toggleTheme = () => {
		if (theme?.includes("dark")) {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	const handleLogout = () => {
		signOut({
			callbackUrl: "/auth/login",
			redirect: true,
		});
	};

	const irAPerfil = () => {
		router.push("/perfil")
	};

	const abrirNotificaciones = () => {
		if (notificaciones.length === 0) {
			notificarTemporal({
				titulo: "Sin notificaciones",
				mensaje: "No hay notificaciones por el momento.",
				variante: "info",
				desaparecerEnMS: 3500,
			});
			return;
		}

		setIsNotificationsOpen(true);
	};

	return (
		<>
			<Menubar className="h-12 w-full overflow-visible border-none bg-sidebar p-0 shadow-none">
				<MenubarMenu>
					<div className={`flex w-full items-center overflow-visible ${isCollapsed ? "justify-center" : "justify-between"}`}>
						{isCollapsed ? (
							<MenubarTrigger className="h-10 w-10 cursor-pointer rounded-full p-0 hover:bg-sidebar-link-hover">
								<span className="relative inline-flex h-10 w-10 items-center justify-center overflow-visible">
									<ProfileImage
										username={userName}
										iniciales={iniciales}
										showUsername={false}
									/>
									{noLeidas > 0 ? (
										<span className="absolute right-0 top-0 inline-flex h-4 min-w-4 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-[#2982CB] px-1 text-[10px] font-bold leading-4 text-white">
											{noLeidas > 9 ? "9+" : noLeidas}
										</span>
									) : null}
								</span>
							</MenubarTrigger>
						) : (
							<>
								<ProfileImage
									username={userName}
									iniciales={iniciales}
								/>
								<MenubarTrigger className="h-10 w-8 cursor-pointer rounded-sm p-0 hover:bg-sidebar-link-hover">
									<span className="relative inline-flex h-8 w-7 items-center justify-center overflow-visible">
										<span className="icon-[qlementine-icons--menu-dots-16] text-2xl" />
										{noLeidas > 0 ? (
											<span className="absolute right-0 top-0 inline-flex h-4 min-w-4 translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full bg-[#2982CB] px-1 text-[10px] font-bold leading-4 text-white">
												{noLeidas > 9 ? "9+" : noLeidas}
											</span>
										) : null}
									</span>
								</MenubarTrigger>
							</>
						)}
					</div>
					<MenubarContent className="bg-sidebar ml-8" side="right">
						<MenubarItem
							className="hover:bg-sidebar-link-hover cursor-pointer"
							onClick={irAPerfil}
						>
							<span className="icon-[oui--app-search-profiler] text-2xl"/>
							Ver perfil
						</MenubarItem>
						<MenubarItem
							className="hover:bg-sidebar-link-hover cursor-pointer"
							onClick={toggleTheme}
						>
							<Icon variant={theme?.includes("dark") ? "sol" : "luna"} className="text-2xl text-sidebar-foreground hover:text-sidebar-foreground-hover" />
							Tema {theme?.includes("dark") ? "Claro" : "Oscuro"}
						</MenubarItem>
						<MenubarItem
							className="hover:bg-sidebar-link-hover cursor-pointer"
							onClick={abrirNotificaciones}
						>
							<span className="icon-[mingcute--notification-newdot-fill] text-2xl"/>
							Notificaciones{noLeidas > 0 ? ` (${noLeidas})` : ""}
						</MenubarItem>
						<MenubarItem
							className="text-error hover:bg-sidebar-link-hover cursor-pointer"
							onClick={handleLogout}
						>
							<span className="icon-[line-md--logout] text-2xl"/>
							Cerrar Sesión
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>
			</Menubar>
			<VentanaNotificaciones
				open={isNotificationsOpen}
				onClose={() => setIsNotificationsOpen(false)}
				notificaciones={notificaciones.map((notificacion) => ({
					id: notificacion.id,
					titulo: notificacion.titulo,
					descripcion: notificacion.descripcion,
					fecha: notificacion.fecha,
					variante: notificacion.variante,
					estado: notificacion.estado,
				}))}
				onMarcarLeida={marcarNotificacionLeida}
				onMarcarTodasLeidas={marcarTodasComoLeidas}
			/>
		</>
	);
}
