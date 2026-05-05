import { ReactNode } from "react";

type SeccionCardProps = {
	children: ReactNode;
	className?: string;
};

export default function SeccionCard({ children, className = "" }: SeccionCardProps) {
	return (
		<div className={`flex flex-col bg-card rounded-xl overflow-hidden border dark:border-white/5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] ${className}`.trim()}>
			{children}
		</div>
	);
}