"use client";
import Icon from "@componentes/icons/Icon";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import ProfileImage from "./ProfileImage";
import obtenerIniciales from "@lib/obtenerIniciales";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@componentes/components/ui/menubar";
import { useRouter } from "next/navigation";

type HeaderProps = {
	isCollapsed: boolean
}

export default function Header({ isCollapsed }: HeaderProps) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { data: session } = useSession();
	const userName = session?.user.username || "No disponible";
	const iniciales = obtenerIniciales(session?.user.first_name, session?.user.last_name);

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

	return (
		<Menubar className="h-12 bg-sidebar border-none overflow-hidden p-0 shadow-none">
			<MenubarMenu>
				<div className="flex justify-between w-full">
					<ProfileImage
						username={userName}
						iniciales={iniciales}
					/>
					<MenubarTrigger
						className={`w-5 cursor-pointer rounded-sm p-0 py-2 ${isCollapsed ? "" : "hover:bg-sidebar-link-hover"}`}
					>
						<span className="icon-[qlementine-icons--menu-dots-16] text-2xl" />
					</MenubarTrigger>
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
						className="text-error hover:bg-sidebar-link-hover cursor-pointer"
						onClick={handleLogout}
					>
						<span className="icon-[line-md--logout] text-2xl"/>
						Cerrar Sesión
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
