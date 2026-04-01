import { ReactNode } from "react";

type TabProps = {
	children: ReactNode;
	active?: boolean;
	onClick?: () => void;
	className?: string;
};

export default function Tab({ children, active, onClick, className = "" }: TabProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`
				px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-xl font-medium
				${active
					? "bg-background-muted text-principal dark:border shadow-sm scale-105"
					: "text-foreground-title hover:text-foreground"
				}
				${className}
			`}
		>
			{children}
		</button>
	);
}
