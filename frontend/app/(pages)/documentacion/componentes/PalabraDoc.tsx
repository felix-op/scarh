import { ReactNode } from "react";

type PalabraDocProps = {
	children: ReactNode
}

export default function PalabraDoc({ children }: PalabraDocProps) {
	return (
		<code className="bg-background-muted px-1 py-0.5 rounded text-accent-blue mx-1 italic">
			{children}
		</code>
	);
}