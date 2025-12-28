"use client";
import { useState } from "react";

type CodigoDocProps = {
    codigo: string;
};

export function CodigoDoc({ codigo }: CodigoDocProps) {
	const [copiado, setCopiado] = useState(false);

	const copiarAlPortapapeles = async () => {
		try {
			await navigator.clipboard.writeText(codigo);
			setCopiado(true);
			setTimeout(() => setCopiado(false), 2000); // Reset tras 2 segundos
		} catch (err) {
			console.error("Error al copiar: ", err);
		}
	};

	return (
		<div className="relative my-4 rounded-lg bg-background-muted border border-border overflow-hidden group">
			<div className="flex justify-between items-center px-4 py-2 bg-background border-b border-border text-xs text-foreground-title font-mono">
				<span>Código de ejemplo</span>
				<button
					onClick={copiarAlPortapapeles}
					className="hover:text-accent-blue transition-colors cursor-pointer uppercase tracking-widest font-bold"
				>
					{copiado ? "¡Copiado!" : "Copiar"}
				</button>
			</div>
			<pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
				<code>{codigo}</code>
			</pre>
		</div>
	);
}