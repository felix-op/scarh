"use client";

import Icon, { IconVariants } from "@componentes/icons/Icon";
import { usePathname, useRouter } from "next/navigation";

type SidebarButtonProps = {
    label: string;
    icono: IconVariants;
    collapsed: boolean;
    href: string;
};

export default function SidebarButton({
	label,
	icono,
	collapsed,
	href,
}: SidebarButtonProps) {
	const router = useRouter();
	const pathname = usePathname();

	const isActive = pathname.startsWith(href);

	return (
		<div className="w-full">
			<button
				type="button"
				onClick={() => router.push(href)}
				className="block w-full border-0 bg-transparent p-0 cursor-pointer"
			>
				<div
					className={`
						flex w-full items-center justify-center rounded-[10px]
						${collapsed ? "gap-0 h-[48px] p-[6px] justify-center" : "gap-6 h-[56px] p-[14px_20px] justify-start"}
						${isActive ? "bg-sidebar-background-active text-sidebar-primary-text-active" : "bg-sidebar-background hover:bg-sidebar-background-hover text-sidebar-primary-text"}
					`}
				>
					<div style={{ marginLeft: collapsed ? 0 : 12 }}>
						<Icon
							variant={icono}
							className={`
								${collapsed ? "w-[28px] h-[28px]" : "w-[32px] h-[32px]"}
								${isActive ? "text-sidebar-primary-text-active" : "text-sidebar-primary-text"}
							`}
						/>
					</div>
					{!collapsed && (
						<span
							className={`
								text-[20px] font-bold
								${isActive ? "text-sidebar-primary-text-active" : "text-sidebar-primary-text"}
							`}
						>
							{label}
						</span>
					)}
				</div>
			</button>
		</div>
	);
}