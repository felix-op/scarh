import clsx from "clsx";
import { ReactElement } from "react";

type IndiceCardProps = {
	icon: string
	children: ReactElement | string
	href: string
	newPage?: boolean
};

export default function IndiceItem({ children, href, icon, newPage = false }: IndiceCardProps) {
	return (
		<a
			className={clsx([
				"flex p-4 items-end justify-between group bg-card",
				"cursor-pointer hover:text-foreground-title hover:border-foreground-title",
				"w-full shrink-0 rounded-xl border-4",
			])}
			href={href}
			target={newPage ? "_blank" : ""}
		>
			<div className="flex items-center gap-2">
				<span className={`text-8xl ${icon} text-foreground transition-transform duration-300 group-hover:scale-105`} />
				<h4>
					{children}
				</h4>
			</div>
			{newPage && (
				<span className="icon-[subway--exit] text-2xl" />
			)}
		</a>
	);
}