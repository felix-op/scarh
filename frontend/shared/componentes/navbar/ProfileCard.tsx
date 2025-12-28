"use client";

import SwapContainer from "@componentes/animaciones/SwapContainer";
import Icon from "@componentes/icons/Icon";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

type ProfileCardProps = {
	collapsed: boolean;
	userName: string;
};

export default function ProfileCard({
	collapsed,
	userName,
}: ProfileCardProps) {
	const router = useRouter();
	const pathname = usePathname() ?? "";
	const isActive = pathname.startsWith("/perfil");

	return (
		<button
			type="button"
			onClick={() => router.push("/perfil")}
			className="w-full border-0 bg-transparent p-0 cursor-pointer"
			aria-label="Ver perfil"
		>
			<div
				className={`
					w-full flex items-center  gap-[6px]
					rounded-[12px] p-[6px_4px] h-16 group
					${isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "bg-sidebar-link hover:bg-sidebar-link-hover text-sidebar-foreground"}
					${collapsed ? "justify-center" : "pl-4 justify-between"}
				`}
			>
				<div className="flex items-center gap-4">
					<Icon variant="user1" className="text-3xl" />
					<div className={`
						transition-all duration-300 ease-in-out
						${collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"} 
					`}>
						<span className={`${isActive ? "text-sidebar-foreground-active" : "text-sidebar-foreground"} text-[18px] font-bold whitespace-nowrap`}>
							{userName}
						</span>
					</div>
				</div>

				{collapsed ? (
					<div className="flex h-10 w-5">
						<SwapContainer
							defaultContent={<Icon variant="newNotification" className="text-md text-[#2982CB]"/>}
							hoverContent={<Icon variant="rightArrow" className="text-md" />}
							containerClassName="flex items-start w-5"
						/>
					</div>
				) : (
					<div className="flex items-center justify-between">
						<div className={`flex h-10 w-10 items-center ${isActive ? "text-sidebar-primary-text-active" : "text-sidebar-primary-text"}`}>
							<SwapContainer
								defaultContent={<Icon variant="newNotification" className="text-xl text-[#2982CB]" />}
								hoverContent={<Icon variant="rightArrow" className="text-xl" />}
							/>
						</div>
					</div>
				)}
			</div>
		</button>
	)
}