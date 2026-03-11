"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, CircleAlert, Clock3 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@componentes/components/ui/dialog";

export type NotificacionItem = {
	id: string;
	titulo: string;
	descripcion: string;
	fecha: string;
	estado?: "nuevo" | "leido" | "solucionado";
};

type VentanaNotificacionesProps = {
	open: boolean;
	onClose: () => void;
	notificaciones?: NotificacionItem[];
	onMarcarLeida?: (id: string) => void | Promise<void>;
};

const EMPTY_NOTIFICATIONS: NotificacionItem[] = [];

const estadoConfig = {
	nuevo: {
		label: "Nueva",
		className: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
		icon: CircleAlert,
	},
	leido: {
		label: "Leida",
		className: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
		icon: Bell,
	},
	solucionado: {
		label: "Solucionada",
		className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
		icon: CheckCheck,
	},
} as const;

export default function VentanaNotificaciones({
	open,
	onClose,
	notificaciones,
	onMarcarLeida,
}: VentanaNotificacionesProps) {
	const notificationsList = notificaciones ?? EMPTY_NOTIFICATIONS;
	const [items, setItems] = useState<NotificacionItem[]>(notificationsList);
	const hoverTimers = useRef<Record<string, number>>({});

	useEffect(() => {
		setItems(notificationsList);
	}, [notificationsList]);

	useEffect(() => {
		const timers = hoverTimers.current;
		return () => {
			Object.values(timers).forEach((timer) => window.clearTimeout(timer));
		};
	}, []);

	const marcarComoLeida = (id: string) => {
		let shouldPersist = false;
		setItems((prev) =>
			prev.map((item) => {
				if (item.id === id && item.estado === "nuevo") {
					shouldPersist = true;
					return { ...item, estado: "leido" };
				}
				return item;
			}),
		);
		if (shouldPersist) {
			void onMarcarLeida?.(id);
		}
	};

	const iniciarLecturaAutomatica = (id: string) => {
		if (hoverTimers.current[id]) {
			window.clearTimeout(hoverTimers.current[id]);
		}

		hoverTimers.current[id] = window.setTimeout(() => {
			marcarComoLeida(id);
			delete hoverTimers.current[id];
		}, 1200);
	};

	const cancelarLecturaAutomatica = (id: string) => {
		if (!hoverTimers.current[id]) return;
		window.clearTimeout(hoverTimers.current[id]);
		delete hoverTimers.current[id];
	};

	return (
		<Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
			<DialogContent
				className="max-w-2xl border-none bg-white/98 p-0 shadow-[0px_24px_60px_rgba(0,0,0,0.22)] dark:bg-[rgb(27,31,37)]"
				overlayClassName="bg-black/35 backdrop-blur-[2px]"
			>
				<DialogHeader className="border-b border-neutral-200 px-6 py-5 text-left dark:border-neutral-700">
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
							<Bell className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-2xl font-extrabold text-neutral-900 dark:text-white">
								Notificaciones
							</DialogTitle>
							<DialogDescription className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">
								Notificaciones recientes y alertas importantes para ti. Mantente informado sobre las novedades y actualizaciones relevantes.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{items.length > 0 && (
					<div className="max-h-[65vh] space-y-3 overflow-y-auto px-6 py-5">
						{items.map((notificacion) => {
							const estadoActual = notificacion.estado ?? "nuevo";
							const estado = estadoConfig[estadoActual];
							const EstadoIcon = estado.icon;
							const esNueva = estadoActual === "nuevo";

							return (
								<article
									key={notificacion.id}
									onMouseEnter={() => iniciarLecturaAutomatica(notificacion.id)}
									onMouseLeave={() => cancelarLecturaAutomatica(notificacion.id)}
									onFocus={() => iniciarLecturaAutomatica(notificacion.id)}
									onBlur={() => cancelarLecturaAutomatica(notificacion.id)}
									onClick={() => marcarComoLeida(notificacion.id)}
									className={`rounded-[24px] border px-5 py-4 shadow-[0px_8px_18px_rgba(0,0,0,0.08)] transition-colors ${esNueva ? "border-sky-200 bg-sky-50/80 hover:bg-sky-100/80 dark:border-sky-900 dark:bg-sky-950/20 dark:hover:bg-sky-950/30" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:bg-neutral-900"}`}
									tabIndex={0}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0 space-y-2">
											<div className="flex items-center gap-2">
												<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${estado.className}`}>
													<EstadoIcon className="size-3.5" />
													{estado.label}
												</span>
												<span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
													<Clock3 className="size-3.5" />
													{notificacion.fecha}
												</span>
												{esNueva && (
													<span className="size-2 rounded-full bg-sky-500" aria-label="No leida" />
												)}
											</div>
											<h3 className={`text-base font-bold ${esNueva ? "text-neutral-950 dark:text-white" : "text-neutral-900 dark:text-white/90"}`}>
												{notificacion.titulo}
											</h3>
											<p className={`${esNueva ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-600 dark:text-neutral-300"} text-sm leading-6`}>
												{notificacion.descripcion}
											</p>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
