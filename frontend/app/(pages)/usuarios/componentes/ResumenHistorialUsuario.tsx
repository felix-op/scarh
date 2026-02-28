"use client";

import { useMemo } from "react";
import { useGetHistoriales, HistorialItem } from "@servicios/api/django.api";

type ResumenHistorialUsuarioProps = {
	username: string;
	maxRecords?: number;
};

const ACTION_LABELS: Record<string, string> = {
	created: "Creación",
	modified: "Modificación",
	deleted: "Eliminación",
	manual_data_load: "Carga manual de datos",
};

const HOUR_FORMATTER = new Intl.DateTimeFormat("es-AR", {
	hour: "2-digit",
	minute: "2-digit",
});

function getActionLabel(type: string) {
	return ACTION_LABELS[type] ?? type;
}

function formatHour(dateValue: string) {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) {
		return "-";
	}
	return HOUR_FORMATTER.format(date);
}

export default function ResumenHistorialUsuario({
	username,
	maxRecords = 6,
}: ResumenHistorialUsuarioProps) {
	const { data: historialData, isLoading } = useGetHistoriales({
		params: {
			queryParams: {
				limit: String(maxRecords),
				page: "1",
				usuario: username,
			},
		},
		configuracion: {
			enabled: Boolean(username),
		},
	});

	const historialUsuario: HistorialItem[] = useMemo(
		() => (Array.isArray(historialData?.results) ? historialData.results : []),
		[historialData],
	);

	const totalRegistros = historialData?.count ?? 0;

	if (isLoading) {
		return (
			<p className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-6 text-center text-[#475569]">
				Cargando historial...
			</p>
		);
	}

	if (historialUsuario.length === 0) {
		return (
			<p className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-6 text-center text-[#475569]">
				No hay registros para este usuario.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<ul className="space-y-3">
				{historialUsuario.map((item) => (
					<li key={item.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
						<div className="grid gap-2 text-sm text-[#334155] md:grid-cols-3">
							<p>
								<span className="font-semibold text-[#0F172A]">Entidad:</span>{" "}
								{item.model_name || "-"}
							</p>
							<p>
								<span className="font-semibold text-[#0F172A]">Acción:</span>{" "}
								{getActionLabel(item.type)}
							</p>
							<p>
								<span className="font-semibold text-[#0F172A]">Hora:</span>{" "}
								{formatHour(item.date)}
							</p>
						</div>
					</li>
				))}
			</ul>

			{totalRegistros > historialUsuario.length ? (
				<p className="text-right text-xs text-[#64748B]">
					Mostrando {historialUsuario.length} de {totalRegistros} registros.
				</p>
			) : null}
		</div>
	);
}
