"use client";
import Icon, { IconVariants } from "@componentes/icons/Icon";
import SidebarButton from "./SidebarButton";
import Divider from "./Divider";
import usePersistedState from "@hooks/usePersistedState";
import useIsMounted from "@hooks/useIsMounted";
import ProfileMenu from "./ProfileMenu";

type SidebarItem = {
	label: string;
	icono: IconVariants;
	href: string
};

const rutas: Record<string, SidebarItem[]> = {
	general: [
		{ label: "Dashboard", icono: "dashboard", href: "/" },
		{ label: "Mapa", icono: "mapa", href: "/mapa" },
		{ label: "Limnigrafos", icono: "chip", href: "/limnigrafos" },
		{ label: "Mediciones", icono: "documento", href: "/mediciones" },
		{ label: "Estadisticas", icono: "funcion", href: "/estadisticas" },
	],
	admin: [
		{ label: "Usuarios", icono: "user1", href: "/usuarios" },
		{ label: "Historial", icono: "historial", href: "/historial" },
		{ label: "Documentacion", icono: "documentacion", href: "/documentacion" },
	],
};

export default function Sidebar() {
	const mounted = useIsMounted();
	
	const [isCollapsed, setIsCollapsed] = usePersistedState("scarh-nav-collapsed", false);

	const toggleSidebar = () => {
		setIsCollapsed((prev) => !prev);
	}

	if (!mounted) {
		return <div className="flex bg-sidebar font-outfit w-70 h-screen" />;
	}

	return (
		<div className="flex bg-sidebar font-outfit">
			<div
				className="flex flex-col gap-3 transition-all duration-300 ease-in-out p-4"
				style={{ alignItems: isCollapsed ? "" : "", width: isCollapsed ? "76px" : "240px" }}
			>
				<div className="flex w-full justify-between">
					<div className="flex shrink-0 items-center gap-4 w-full overflow-hidden">
						<img
							src="/seaborn.png"
							alt="Mapa de fondo"
							className="h-10 w-10"
						/>
						<span
							className="text-2xl font-bold text-logo letter-spacing-[1px] text-uppercase"
						>
							SCARH
						</span>
					</div>
					<button
						type="button"
						onClick={toggleSidebar}
						className="border-0 bg-transparent p-[4px] rounded-[8px] cursor-pointer"
						aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<Icon variant={isCollapsed ? "menu_derecha" : "menu_izquierda"} className="text-2xl text-sidebar-secondary" />
					</button>
					{/* <span className="icon-[devicon--seaborn] h-10 w-10 text-2xl"/> */}
				</div>
				<Divider direccion="horizontal" />
				<ProfileMenu isCollapsed={isCollapsed} />
				<div className="flex justify-center w-full">
					<span
						className="text-lg font-bold text-logo letter-spacing-[1px] text-uppercase"
					>
						General
					</span>
				</div>
				<Divider direccion="horizontal" />
				<div className="flex flex-col gap-2 w-full">
					{rutas.general.map(({ label, icono, href }) => (
						<SidebarButton
							key={label}
							label={label}
							icono={icono}
							href={href}
						/>
					))}
				</div>
				<div className="flex justify-center w-full">
					<span
						className="text-lg font-bold text-logo letter-spacing-[1px] text-uppercase"
					>
						Admin
					</span>
				</div>
				<Divider direccion="horizontal" />
				<div className="flex flex-col gap-2 w-full">
					{rutas.admin.map(({ label, icono, href }) => (
						<SidebarButton
							key={label}
							label={label}
							icono={icono}
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
