import BotonVariante from "@componentes/botones/BotonVariante";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@componentes/components/ui/dialog";

type VentanaConfirmarCierreProps = {
	open: boolean,
	onClose: () => void,
	onConfirm: () => void,
	title?: string,
	description?: string,
};

export default function VentanaConfirmarCierre({
	open,
	onClose,
	onConfirm,
	title = "Cierre",
	description = "Está seguro que desea confirmar el Cierre?",
}: VentanaConfirmarCierreProps) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="flex flex-col bg-ventana">
				<div className="flex gap-4">
					<span className="text-5xl icon-[mingcute--alert-fill]" />
					<div className="flex flex-col w-full gap-2">
						<DialogTitle>
							{title}
						</DialogTitle>
						<DialogDescription>
							{description}
						</DialogDescription>
					</div>
				</div>
				<div className="flex w-full justify-between">
					<BotonVariante variant="cerrar" onClick={onClose} />
					<BotonVariante variant="confirmarError" onClick={onConfirm} />
				</div>
			</DialogContent>
		</Dialog>
	);
}