import { ReactNode } from "react";

export type SeccionInfoGroupsProps = {
	children: ReactNode;
};

export default function SeccionInfoGroups({
	children,
}: SeccionInfoGroupsProps) {
	return (
		<div className="flex flex-col items-stretch gap-6 xl:flex-row">
			{children}
		</div>
	);
}
