import { ReactNode } from "react";

export type SeccionInfoGroupProps = {
	children: ReactNode;
};

export default function SeccionInfoGroup({ children }: SeccionInfoGroupProps) {
	return <section className="flex flex-col gap-2 flex-1">{children}</section>;
}
