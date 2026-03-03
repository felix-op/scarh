import { AxiosError } from "axios";
import Alerta from "./Alerta";
import { BackendError } from "@servicios/api/types";

type AlertaErrorBackendProps = {
	error: AxiosError<BackendError> | null;
};

export default function AlertaErrorBackend({ error }: AlertaErrorBackendProps) {
	const detail = error?.response?.data;

	if (!detail) return null;
	
	return (
		<Alerta variant="error">
			<div className="flex flex-col">
				<strong>Error {detail?.codigo || ""}: {detail?.titulo}</strong>
				{detail?.descripcion_usuario && (
					<p>{detail.descripcion_usuario}</p>
				)}
			</div>
		</Alerta>
	);
}
