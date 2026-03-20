import { ReactNode } from "react";

export type SeccionInfoProps = {
	children: ReactNode;
};

export default function SeccionInfo({ children }: SeccionInfoProps) {
	return (
		<div className="flex w-full max-w-screen-2xl flex-col gap-6 rounded-[32px] bg-background-muted p-6 shadow-[0px_4px_18px_rgba(0,0,0,0.18)]">
			{children}
		</div>
	);
}
