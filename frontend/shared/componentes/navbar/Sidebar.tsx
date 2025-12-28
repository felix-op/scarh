"use client";
import { useRouter } from "next/navigation";
import ProfileCard from "./ProfileCard";
import Icon, { IconVariants } from "@componentes/icons/Icon";
import SidebarButton from "./SidebarButton";
import Divider from "./Divider";
import { useTheme } from "next-themes";
import usePersistedState from "@hooks/usePersistedState";
import useIsMounted from "@hooks/useIsMounted";

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
	{ label: "Documentacion", icono: "documentacion", href: "/documentacion" },
];

export default function Sidebar() {
	const mounted = useIsMounted();
	
	const userName="Juan Perez"
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	
	const [isCollapsed, setIsCollapsed] = usePersistedState("scarh-nav-collapsed", false);

	const toggleSidebar = () => {
		setIsCollapsed((prev) => !prev);
	}

	const toggleTheme = () => {
		if (theme?.includes("dark")) {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	if (!mounted) {
		return <div className="flex bg-sidebar font-outfit w-70 h-screen" />;
	}

	return (
		<div className="flex bg-sidebar font-outfit">
			<div
				className={`
					flex flex-col gap-3 transition-all duration-300 ease-in-out
					${isCollapsed ? "w-30 items-center p-4" : "w-70 items-stretch p-4"}
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
						onClick={toggleTheme}
						className="border-0 bg-transparent p-[4px] rounded-[8px] cursor-pointer"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<Icon variant={theme?.includes("dark") ? "sol" : "luna"} className="text-2xl text-sidebar-secondary" />
					</button>
					<button
						type="button"
						onClick={toggleSidebar}
						className="border-0 bg-transparent p-[4px] rounded-[8px] cursor-pointer"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<Icon variant={isCollapsed ? "menu_derecha" : "menu_izquierda"} className="text-2xl text-sidebar-secondary" />
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
								font-bold text-logo letter-spacing-[1px] text-uppercase
							`}
						>
							Inicio
						</span>
					</button>
				</div>
				<Divider direccion="horizontal" />
				<ProfileCard
					collapsed={isCollapsed}
					userName={userName}
				/>
				<Divider direccion="horizontal" />
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
					flex flex-col items-center py-20 w-[18px] 
				`}
			>
				<Divider direccion="vertical" />
			</div>
		</div>
	);
}