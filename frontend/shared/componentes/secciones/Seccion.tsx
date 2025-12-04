import { ReactNode } from "react";

type SeccionProps = {
	children: ReactNode;
	className?: string;
};

export default function Seccion({
	children,
	className = '',
}: SeccionProps) {
	return (
		<div
			className={`
				flex flex-col relative z-2 gap-6
				w-full rounded-lg p-4 md:p-6
				bg-white/80 backdrop-blur-lg border border-border
				${className}
			`}
		>
			{children}
		</div>
	);
}