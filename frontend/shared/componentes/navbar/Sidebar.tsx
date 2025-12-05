"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard";
import Icon, { IconVariants } from "@componentes/icons/Icon";
import SidebarButton from "./SidebarButton";
import Divider from "./Divider";

type SidebarItem = {
	label: string;
	icono: IconVariants;
	href: string
};

const rutas: SidebarItem[] = [
	{ label: "Mapa", icono: "mapa", href: "/mapa" },
	{ label: "Limnigrafo", icono: "chip", href: "/limnigrafos" },
	{ label: "Mediciones", icono: "documento", href: "/mediciones" },
	{ label: "Metricas", icono: "regla", href: "/metricas" },
	{ label: "Estadisticas", icono: "funcion", href: "/estadisticas" },
	{ label: "Usuarios", icono: "user1", href: "/usuarios" },
	{ label: "Historial", icono: "historial", href: "/historial" },
];

const sidebarKey = "scarh-nav-collapsed";

export default function Sidebar() {
	const userName="Juan Perez"

	const router = useRouter();
	
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const stored =
			window.sessionStorage.getItem(sidebarKey) === "true";
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsCollapsed(stored);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.sessionStorage.setItem(
				sidebarKey,
				isCollapsed ? "true" : "false",
			);
		}
	}, [isCollapsed]);

	function toggleSidebar() {
		setIsCollapsed((prev) => !prev);
	}

	return (
		<div className="flex bg-white font-outfit">
			<div
				className={`
					flex flex-col gap-[12px] transition-all duration-300 ease-in-out
					${isCollapsed ? "w-28 items-center p-[20px_8px]" : "w-70 items-stretch p-[20px_10px]"}
				`}
			>
				<div
					className={`
						flex w-full
						${isCollapsed ? "justify-center" : "justify-end"}
					`}
				>
					<button
						type="button"
						onClick={toggleSidebar}
						className="border-0 bg-transparent p-[4px] rounded-[8px] cursor-pointer"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<Icon variant={isCollapsed ? "menu_derecha" : "menu_izquierda"} className="text-2xl text-[#6B6B6B]" />
					</button>
				</div>

				<div className={`flex justify-center w-full ${isCollapsed ? "p-[0_0_2px]" : "p-[0_0_4px]"}`}>
					<button
						type="button"
						onClick={() => router.push("/inicio")}
						className="border-0 bg-transparent p-0 cursor-pointer"
						aria-label="Ir al home"
					>
						<span
							className={`
								${isCollapsed ? "text-[22px]" : "text-[30px]"}
								font-bold text-[#0D76B3] letter-spacing-[1px] text-uppercase
							`}
						>
							Inicio
						</span>
					</button>
				</div>
				<Divider />
				<ProfileCard
					collapsed={isCollapsed}
					userName={userName}
				/>
				<Divider />
				<div className="flex flex-col gap-[12px] w-full">
					{rutas.map(({ label, icono, href }) => (
						<SidebarButton
							key={label}
							label={label}
							icono={icono}
							collapsed={isCollapsed}
							href={href}
						/>
					))}
				</div>
			</div>
			<div
				className={`
					flex flex-col items-center relative gap-[20px]
					pb-[40px] w-[18px] ${isCollapsed ? "pt-[60px]" : "pt-[90px]"}
				`}
			>
				<div
					className={`absolute bottom-[40px] w-px bg-[#D3D4D5] ${isCollapsed ? "top-[60px]" : "top-[90px]"}`}
				/>
			</div>
		</div>
	);
}