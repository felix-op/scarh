import { ReactNode } from "react";

export type SeccionInfoHeaderProps = {
	children: ReactNode;
};

export default function SeccionInfoHeader({
	children,
}: SeccionInfoHeaderProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col md:flex-row flex-wrap gap-2 md:self-end">
				{children}
			</div>
		</div>
	);
}
