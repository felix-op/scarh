"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("ErrorBoundary atrapó un error:", error);
	}, [error]);

	return (
		<div className="flex w-full min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
			<div className="flex max-w-lg w-full flex-col items-center text-center bg-white dark:bg-[#111923] p-10 rounded-[1.25rem] shadow-sm border border-border transition-colors animate-fade-in-up">
				<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-error-claro text-error">
					<TriangleAlert size={48} strokeWidth={1.5} />
				</div>
				
				<h1 className="mb-2 text-3xl font-bold text-foreground-title">
					Panel de Error
				</h1>
				
				<h2 className="mb-4 text-xl font-medium text-foreground">
					Ocurrió un problema inesperado
				</h2>
				
				<p className="mb-8 text-sidebar-secondary dark:text-gray-400">
					La interfaz encontró un fallo crítico al procesar tu solicitud. 
					Podría ser temporal, puedes intentar volver a cargarla.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
					<button
						onClick={() => reset()}
						className="inline-flex items-center justify-center rounded-xl bg-[#0170b0] hover:bg-[#0982c8] dark:bg-[#0da2f8] dark:hover:bg-[#3e99ce] text-white font-medium px-8 py-3 transition-colors duration-200 shadow-sm"
					>
						Intentar de nuevo
					</button>
					<Link
						href="/inicio"
						className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 dark:bg-transparent dark:hover:bg-white/5 text-[#0170b0] border border-[#0170b0] dark:text-[#0da2f8] dark:border-[#0da2f8] font-medium px-8 py-3 transition-colors duration-200 shadow-sm"
					>
						Volver al inicio
					</Link>
				</div>
			</div>
		</div>
	);
}
