import { ReactNode } from "react";
import "./filtros.css";

type FiltrosContenedorProps = {
	open?: boolean
	children: ReactNode
}

export default function FiltrosContenedor({ open = true, children }: FiltrosContenedorProps) {
	return (
		<div className={`filtros-wrapper ${open ? 'is-open' : ''}`}>
			<div className="filtros-inner">		
				<div className="flex flex-col gap-4 bg-table p-4 border rounded-sm dark:border-white/5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
					{children}
				</div>
			</div>
		</div>
	);
}
