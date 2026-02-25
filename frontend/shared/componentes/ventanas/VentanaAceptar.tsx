import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@componentes/components/ui/dialog";
import BotonVariante from "@componentes/botones/BotonVariante";

const variantClass = {
	exito: {
		icon: "icon-[lsicon--circle-succeed-filled] text-exito",
	},
	error: {
		icon: "icon-[typcn--info-outline] text-error",
	},
	alerta: {
		icon: "icon-[typcn--info-outline]",
	},
	info: {
		icon: "icon-[material-symbols--info] text-principal",
	},
};

export type VentanaAceptarOptions = {
	title: string
	description: string
	variant: keyof typeof variantClass
};

type VentanaAceptarProps = {
	open: boolean
	onClose: () => void
	options: VentanaAceptarOptions
};

export default function VentanaAceptar({ open, onClose, options}: VentanaAceptarProps) {
	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="flex flex-col bg-ventana">
				<div className="flex gap-4">
					<span className={`text-5xl ${variantClass[options.variant].icon}`} />
					<div className="flex flex-col w-full gap-2">
						<DialogTitle>
							{options.title}
						</DialogTitle>
						<DialogDescription>
							{options.description}
						</DialogDescription>
					</div>
				</div>
				<div className="flex w-full justify-end">
					<BotonVariante onClick={onClose}>
						Aceptar
					</BotonVariante>
				</div>
			</DialogContent>
		</Dialog>
	);
}
