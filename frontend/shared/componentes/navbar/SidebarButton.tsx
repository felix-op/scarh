"use client";

import Icon, { IconVariants } from "@componentes/icons/Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SidebarButtonProps = {
    label: string;
    icono: IconVariants;
    href: string;
};

export default function SidebarButton({
	label,
	icono,
	href,
}: SidebarButtonProps) {
	const pathname = usePathname();

	const isActive = pathname.startsWith(href);

	return (
		<div className="w-full">
			<Link
				href={href}
				className="block w-full border-0 bg-transparent p-0 cursor-pointer"
			>
				<div
					className={`
						flex w-full items-center rounded-[10px]
						overflow-hidden py-1 px-2 gap-4
						${isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "hover:bg-sidebar-link-hover text-sidebar-foreground"}
					`}
				>
					<div>
						<Icon
							variant={icono}
							className={`
								w-7 h-7
								${isActive ? "text-sidebar-foreground-active" : "text-sidebar-foreground"}
							`}
						/>
					</div>
					<span
						className={`
							text-lg font-bold self-start
							${isActive ? "text-sidebar-foreground-active" : "text-sidebar-foreground"}
						`}
					>
						{label}
					</span>
				</div>
			</Link>
		</div>
	);
}
