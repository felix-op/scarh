import { ReactNode } from "react";

type TabsContainerProps = {
	children: ReactNode;
	className?: string;
};

export default function TabsContainer({ children, className = "" }: TabsContainerProps) {
	return (
		<div
			className={`flex rounded-xl items-center justify-center gap-2 w-fit mx-auto ${className}`}
		>
			{children}
		</div>
	);
}
