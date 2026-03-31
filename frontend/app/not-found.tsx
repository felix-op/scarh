"use client";

import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
	return (
		<div className="flex w-full min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
			<div className="flex max-w-lg w-full flex-col items-center text-center bg-white dark:bg-[#111923] p-10 rounded-[1.25rem] shadow-sm border border-border transition-colors animate-fade-in-up">
				<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-principal-claro/20 text-principal">
					<MapPinOff size={48} strokeWidth={1.5} />
				</div>
        
				<h1 className="mb-2 text-3xl font-bold text-foreground-title">
					Error 404
				</h1>
        
				<h2 className="mb-4 text-xl font-medium text-foreground">
					Página no encontrada
				</h2>
        
				<p className="mb-8 text-sidebar-secondary dark:text-gray-400">
					Lo sentimos, la ruta a la que intentas acceder no existe o fue movida.
					Por favor verifica que la dirección esté escrita correctamente.
				</p>
        
				<Link 
					href="/inicio" 
					className="inline-flex items-center justify-center rounded-xl bg-[#0170b0] hover:bg-[#0982c8] dark:bg-[#0da2f8] dark:hover:bg-[#3e99ce] text-white font-medium px-8 py-3 transition-colors duration-200 shadow-sm"
				>
					Volver al inicio
				</Link>
			</div>
		</div>
	);
}
