import BotonVariante from "@componentes/botones/BotonVariante";
import Icon from "@componentes/icons/Icon";
import { ReactNode } from "react";

type MensajeErrorProps = {
	titulo: string;
	children: ReactNode;
	handleReintentar: () => void;
};

export default function MensajeError({ titulo, handleReintentar, children }: MensajeErrorProps) {
	return (
		<div className="flex items-center gap-2 p-4 border-2 border-error text-error bg-error-claro rounded-lg">
			<div className="flex flex-col w-full gap-2">
				<div className="flex flex-col">
					<div className="flex gap-2 items-center">
						<Icon variant="alerta" className="text-4xl" />
						<span className="text-2xl font-bold">{titulo}</span>
					</div>
					{children}
				</div>
				{handleReintentar && (
					<div className="self-end">
						<BotonVariante variant="default" onClick={handleReintentar}>
							<span className="text-error">Reintentar</span>
						</BotonVariante>
					</div>
				)}
			</div>
		</div>
	);
}
