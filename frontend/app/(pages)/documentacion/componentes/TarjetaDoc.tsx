import { ReactNode } from "react";

type TarjetaDocProps = {
    children: ReactNode
}

export default function TarjetaDoc({ children }: TarjetaDocProps) {
	return (
		<div className="p-6 border rounded-lg bg-card border-border shadow-sm mb-8">
			{children}
		</div>
	);
}