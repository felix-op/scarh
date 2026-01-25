import { ReactNode } from "react";

type ActionMenuProps = {
    children: ReactNode;
};

export default function ActionMenu({
	children
}: ActionMenuProps) {
	return (
		<div className="flex justify-start pl-4 items-center w-full h-full">
			{children}
		</div>
	);
}