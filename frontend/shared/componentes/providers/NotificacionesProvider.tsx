"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { useGetAlertas, usePatchAlerta } from "@servicios/api";

type VarianteNotificacion = "info" | "error" | "exito" | "alerta";
type EstadoNotificacion = "nuevo" | "leido" | "solucionado";
type FuenteNotificacion = "toast" | "alerta";

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

export type NotificacionHistorialItem = {
	id: string;
	titulo: string;
	descripcion: string;
	fecha: string;
	fechaISO: string;
	variante: VarianteNotificacion;
	estado: EstadoNotificacion;
	fuente: FuenteNotificacion;
	alertaNotificacionId?: string;
};

type NotificacionesContextValue = {
	notificar: (input: NotificacionInput) => string;
	notificarTemporal: (input: NotificacionInput) => string;
	cerrarNotificacion: (id: string) => void;
	notificaciones: NotificacionHistorialItem[];
	noLeidas: number;
	marcarNotificacionLeida: (id: string) => Promise<void>;
	marcarTodasComoLeidas: () => Promise<void>;
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
	const [historial, setHistorial] = useState<NotificacionHistorialItem[]>([]);
	const timersRef = useRef<Record<string, number>>({});
	const nextIdRef = useRef(0);
	const seenAlertIdsRef = useRef<Set<number>>(new Set());
	const { status, data: session } = useSession();
	const { data: alertas } = useGetAlertas({
		configuracion: {
			enabled: status === "authenticated",
			refetchInterval: 15000,
			refetchIntervalInBackground: true,
		},
	});
	const patchAlerta = usePatchAlerta({
		params: { id: "" },
		configuracion: {
			queriesToInvalidate: ["useGetAlertas"],
		},
	});
	const usuarioKey = useMemo(() => {
		const user = session?.user as { id?: string; username?: string; email?: string } | undefined;
		return user?.id || user?.username || user?.email || null;
	}, [session]);
	const storageKey = usuarioKey ? `scarh-notificaciones:${usuarioKey}` : null;

	const formatearFecha = useCallback((fechaISO: string) => {
		const fecha = new Date(fechaISO);
		if (Number.isNaN(fecha.getTime())) {
			return "Fecha desconocida";
		}
		return fecha.toLocaleString("es-AR", {
			dateStyle: "short",
			timeStyle: "short",
		});
	}, []);

	const leerHistorialPersistido = useCallback((key: string | null) => {
		if (!key) {
			return [] as NotificacionHistorialItem[];
		}

		try {
			const raw = window.localStorage.getItem(key);
			if (!raw) {
				return [] as NotificacionHistorialItem[];
			}

			const parsed = JSON.parse(raw) as NotificacionHistorialItem[];
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [] as NotificacionHistorialItem[];
		}
	}, []);

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

	const mostrarToast = useCallback(({
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

	const upsertHistorial = useCallback((item: NotificacionHistorialItem) => {
		setHistorial((prev) => {
			const index = prev.findIndex((existing) => existing.id === item.id);
			if (index === -1) {
				return [item, ...prev].sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime());
			}

			const next = [...prev];
			next[index] = {
				...next[index],
				...item,
			};
			return next.sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime());
		});
	}, []);

	const notificar = useCallback((input: NotificacionInput) => {
		const toastId = mostrarToast(input);
		const fechaISO = new Date().toISOString();

		upsertHistorial({
			id: toastId,
			titulo: input.titulo,
			descripcion: input.mensaje,
			fecha: formatearFecha(fechaISO),
			fechaISO,
			variante: input.variante ?? "info",
			estado: "nuevo",
			fuente: "toast",
		});

		return toastId;
	}, [formatearFecha, mostrarToast, upsertHistorial]);

	const notificarTemporal = useCallback((input: NotificacionInput) => mostrarToast(input), [mostrarToast]);

	useEffect(() => {
		const nextHistorial = leerHistorialPersistido(storageKey);
		const syncId = window.setTimeout(() => {
			setHistorial(nextHistorial);
		}, 0);

		return () => window.clearTimeout(syncId);
	}, [leerHistorialPersistido, storageKey]);

	useEffect(() => {
		if (!storageKey) {
			return;
		}

		window.localStorage.setItem(storageKey, JSON.stringify(historial));
	}, [historial, storageKey]);

	useEffect(() => {
		if (status !== "authenticated") {
			seenAlertIdsRef.current.clear();
		}
	}, [status]);

	useEffect(() => {
		if (!Array.isArray(alertas)) return;

		alertas.forEach((alerta) => {
			const historialId = `alerta-${alerta.id}`;
			const fechaISO = alerta.fecha_hora;
			upsertHistorial({
				id: historialId,
				titulo: alerta.limnigrafo_codigo
					? `Alerta en ${alerta.limnigrafo_codigo}`
					: "Alerta del sistema",
				descripcion: alerta.descripcion,
				fecha: formatearFecha(fechaISO),
				fechaISO,
				variante: "alerta",
				estado: alerta.estado,
				fuente: "alerta",
				alertaNotificacionId: String(alerta.id),
			});

			if (seenAlertIdsRef.current.has(alerta.id)) {
				return;
			}

			seenAlertIdsRef.current.add(alerta.id);

			if (alerta.estado !== "nuevo") {
				return;
			}

			mostrarToast({
				titulo: alerta.limnigrafo_codigo
					? `Alerta en ${alerta.limnigrafo_codigo}`
					: "Alerta del sistema",
				mensaje: alerta.descripcion,
				variante: "alerta",
				desaparecerEnMS: (
					alerta.tipo === "advertencia_limnigrafo" || alerta.tipo === "peligro_limnigrafo"
						? 12000
						: 6000
				),
			});
		});
	}, [alertas, formatearFecha, mostrarToast, upsertHistorial]);

	const marcarNotificacionLeida = useCallback(async (id: string) => {
		const item = historial.find((notificacion) => notificacion.id === id);
		if (!item || item.estado !== "nuevo") {
			return;
		}

		setHistorial((prev) => prev.map((notificacion) => (
			notificacion.id === id
				? { ...notificacion, estado: "leido" }
				: notificacion
		)));

		if (item.fuente === "alerta" && item.alertaNotificacionId) {
			try {
				await patchAlerta.mutateAsync({
					params: { id: item.alertaNotificacionId },
					data: { estado: "leido" },
				});
			} catch {
				setHistorial((prev) => prev.map((notificacion) => (
					notificacion.id === id
						? { ...notificacion, estado: item.estado }
						: notificacion
				)));
			}
		}
	}, [historial, patchAlerta]);

	const marcarTodasComoLeidas = useCallback(async () => {
		const pendientes = historial.filter((item) => item.estado === "nuevo");
		if (pendientes.length === 0) {
			return;
		}

		setHistorial((prev) => prev.map((item) => (
			item.estado === "nuevo"
				? { ...item, estado: "leido" }
				: item
		)));

		const alertasPendientes = pendientes.filter((item) => item.fuente === "alerta" && item.alertaNotificacionId);
		try {
			await Promise.all(alertasPendientes.map((item) => patchAlerta.mutateAsync({
				params: { id: item.alertaNotificacionId ?? "" },
				data: { estado: "leido" },
			})));
		} catch {
			const idsPendientes = new Set(pendientes.map((item) => item.id));
			setHistorial((prev) => prev.map((item) => (
				idsPendientes.has(item.id)
					? { ...item, estado: "nuevo" }
					: item
			)));
		}
	}, [historial, patchAlerta]);

	const noLeidas = historial.filter((item) => item.estado === "nuevo").length;

	return (
		<NotificacionesContext.Provider value={{
			notificar,
			notificarTemporal,
			cerrarNotificacion,
			notificaciones: historial,
			noLeidas,
			marcarNotificacionLeida,
			marcarTodasComoLeidas,
		}}>
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

export function useNotificaciones() {
	const context = useContext(NotificacionesContext);

	if (!context) {
		throw new Error("useNotificaciones debe usarse dentro de NotificacionesProvider");
	}

	return context;
}
