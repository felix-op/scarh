import BotonVariante, { ButtonVariant } from "@componentes/botones/BotonVariante";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@componentes/components/ui/dialog";

type TVariant = {
	icon: string;
	button: ButtonVariant;
};

const variants: Record<string, TVariant> = {
	accion: {
		icon: "icon-[mingcute--question-line]",
		button: "confirmarExito",
	},
	cierre: {
		icon: "icon-[mingcute--alert-fill]",
		button: "confirmarError",
	},
	eliminar: {
		icon: "icon-[line-md--trash]",
		button: "confirmarError",
	},
};

export type VentanaConfirmarProps = {
	open: boolean,
	onClose: () => void,
	onConfirm: () => void,
	title?: string,
	description?: string,
	icon?: string,
	variant?: "accion" | "cierre" | "eliminar",
};

export default function VentanaConfirmar({
	open,
	onClose,
	onConfirm,
	title = "Confirmar",
	description = "Está seguro que desea confirmar?",
	icon = "icon-[mingcute--alert-fill]",
	variant = "cierre",
}: VentanaConfirmarProps) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="flex flex-col bg-ventana">
				<div className="flex gap-4">
					<span className={`text-5xl ${icon}`} />
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
					<BotonVariante variant={variants[variant].button} onClick={onConfirm} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
