"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { useGetAlertas } from "@servicios/api";

type VarianteNotificacion = "info" | "error" | "exito" | "alerta";

type NotificacionInput = {
	titulo: string;
	mensaje: string;
	variante?: VarianteNotificacion;
	desaparecerEnMS?: number | false;
};

type NotificacionGlobal = NotificacionInput & {
	id: string;
	variante: VarianteNotificacion;
};

type NotificacionesContextValue = {
	notificar: (input: NotificacionInput) => string;
	cerrarNotificacion: (id: string) => void;
};

const NotificacionesContext = createContext<NotificacionesContextValue | null>(null);

const varianteConfig = {
	info: {
		Icono: Info,
		cardClassName: "border-sky-200 bg-white text-neutral-900 dark:border-sky-900 dark:bg-[rgb(27,31,37)] dark:text-white",
		iconClassName: "text-sky-600 dark:text-sky-300",
	},
	error: {
		Icono: AlertCircle,
		cardClassName: "border-red-200 bg-white text-neutral-900 dark:border-red-900 dark:bg-[rgb(27,31,37)] dark:text-white",
		iconClassName: "text-red-600 dark:text-red-300",
	},
	exito: {
		Icono: CheckCircle2,
		cardClassName: "border-emerald-200 bg-white text-neutral-900 dark:border-emerald-900 dark:bg-[rgb(27,31,37)] dark:text-white",
		iconClassName: "text-emerald-600 dark:text-emerald-300",
	},
	alerta: {
		Icono: AlertTriangle,
		cardClassName: "border-amber-200 bg-white text-neutral-900 dark:border-amber-900 dark:bg-[rgb(27,31,37)] dark:text-white",
		iconClassName: "text-amber-600 dark:text-amber-300",
	},
} as const;

type NotificacionesProviderProps = {
	children: ReactNode;
};

export default function NotificacionesProvider({ children }: NotificacionesProviderProps) {
	const [notificaciones, setNotificaciones] = useState<NotificacionGlobal[]>([]);
	const timersRef = useRef<Record<string, number>>({});
	const nextIdRef = useRef(0);
	const seenAlertIdsRef = useRef<Set<number>>(new Set());
	const { status } = useSession();
	const { data: alertas } = useGetAlertas({
		configuracion: {
			enabled: status === "authenticated",
			refetchInterval: 15000,
			refetchIntervalInBackground: true,
		},
	});

	useEffect(() => {
		const timers = timersRef.current;
		return () => {
			Object.values(timers).forEach((timer) => window.clearTimeout(timer));
		};
	}, []);

	const cerrarNotificacion = (id: string) => {
		if (timersRef.current[id]) {
			window.clearTimeout(timersRef.current[id]);
			delete timersRef.current[id];
		}

		setNotificaciones((prev) => prev.filter((item) => item.id !== id));
	};

	const notificar = useCallback(({
		titulo,
		mensaje,
		variante = "info",
		desaparecerEnMS = 3000,
	}: NotificacionInput) => {
		nextIdRef.current += 1;
		const id = `notificacion-${nextIdRef.current}`;

		setNotificaciones((prev) => [
			...prev,
			{
				id,
				titulo,
				mensaje,
				variante,
				desaparecerEnMS,
			},
		]);

		if (desaparecerEnMS !== false) {
			timersRef.current[id] = window.setTimeout(() => {
				cerrarNotificacion(id);
			}, desaparecerEnMS);
		}

		return id;
	}, []);

	useEffect(() => {
		if (status !== "authenticated") {
			seenAlertIdsRef.current.clear();
		}
	}, [status]);

	useEffect(() => {
		if (!Array.isArray(alertas)) return;

		alertas.forEach((alerta) => {
			if (seenAlertIdsRef.current.has(alerta.id)) {
				return;
			}

			seenAlertIdsRef.current.add(alerta.id);

			if (alerta.estado !== "nuevo") {
				return;
			}

			notificar({
				titulo: alerta.limnigrafo_codigo
					? `Alerta en ${alerta.limnigrafo_codigo}`
					: "Alerta del sistema",
				mensaje: alerta.descripcion,
				variante: "alerta",
				desaparecerEnMS: 6000,
			});
		});
	}, [alertas, notificar]);

	return (
		<NotificacionesContext.Provider value={{ notificar, cerrarNotificacion }}>
			{children}
			<div className="pointer-events-none fixed top-4 right-4 z-[120] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
				{notificaciones.map((notificacion) => {
					const config = varianteConfig[notificacion.variante];
					const Icono = config.Icono;

					return (
						<div
							key={notificacion.id}
							className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0px_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm ${config.cardClassName}`}
						>
							<div className="flex items-start gap-3">
								<div className={`mt-0.5 shrink-0 ${config.iconClassName}`}>
									<Icono className="size-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-3">
										<p className="text-sm font-bold leading-5">
											{notificacion.titulo}
										</p>
										<button
											type="button"
											onClick={() => cerrarNotificacion(notificacion.id)}
											className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
											aria-label="Cerrar notificacion"
										>
											<X className="size-4" />
										</button>
									</div>
									<p className="mt-1 text-sm leading-5 text-neutral-600 dark:text-neutral-300">
										{notificacion.mensaje}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</NotificacionesContext.Provider>
	);
}

export function useNotificar() {
	const context = useContext(NotificacionesContext);

	if (!context) {
		throw new Error("useNotificar debe usarse dentro de NotificacionesProvider");
	}

	return context.notificar;
}
