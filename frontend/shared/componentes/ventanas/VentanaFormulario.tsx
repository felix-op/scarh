"use client";

import BotonVariante from "@componentes/botones/BotonVariante";
import Formulario from "@componentes/formularios/Formulario";
import { ReactNode, useCallback, useState } from "react";
import { Drawer, DrawerContent, DrawerTitle, DrawerFooter, DrawerDescription } from "@componentes/components/ui/drawer";
import { DefaultValues, FieldValues } from "react-hook-form";
import VentanaConfirmar from "./VentanaConfirmar";

type VentanaFormularioProps<T extends FieldValues> = {
	open: boolean;
	onClose: () => void,
	onSubmit: (data: T) => void,
	valoresIniciales: DefaultValues<T>,
	children: ReactNode,
	titulo?: string,
	descripcion?: string,
	classNameVentana?: string,
	classNameFormulario?: string,
	classNameContenido?: string,	
};

export default function VentanaFormulario<T extends FieldValues>({
	open,
	onClose,
	onSubmit,
	children,
	valoresIniciales,
	titulo = "",
	descripcion = "",
	classNameVentana = "",
	classNameFormulario = "",
	classNameContenido = "",
}: VentanaFormularioProps<T>) {
	const [edited, setEdited] = useState(false);
	const [confirmar, setConfirmar] = useState(false);

	const onDirty = useCallback((dirty: boolean) => {
		if (dirty) {
			setEdited(true);
		}
	}, [setEdited]);

	const handleClose = () => {
		if (!edited) {
			onClose();
		} else {
			setConfirmar(true);
		}
	};

	return (
		<>
			<Drawer open={open} onClose={handleClose} direction="right" dismissible={!edited}>
				<DrawerContent className={`bg-transparent border-none py-4 pr-2 ${classNameVentana}`}>
					<div className="flex flex-col bg-ventana dark:border w-full h-full rounded-lg">
						<DrawerTitle className="flex justify-between items-center p-5 shrink-0">
							<span className="text-2xl text-ventana-foreground font-bold">{titulo}</span>
							<button type="button" className="flex bg-ventana-secondary rounded-full cursor-pointer text-foreground hover:text-error p-2" onClick={handleClose}>
								<span className="icon-[material-symbols--close] text-2xl" />
							</button>
						</DrawerTitle>
						<hr className="h-[2px] bg-ventana-secondary" />
						<Formulario className={`flex flex-col grow overflow-y-auto ${classNameFormulario}`} valoresIniciales={valoresIniciales} onSubmit={onSubmit} onDirty={onDirty}>
							<DrawerDescription>{descripcion}</DrawerDescription>
							<div className={`p-5 grow overflow-y-auto ${classNameContenido}`}>
								{children}
							</div>
							<hr className="h-[2px] bg-ventana-secondary" />
							<DrawerFooter className="sm:flex-row justify-between p-5 shrink-0">
								<BotonVariante variant="cancelar" onClick={handleClose} />
								<BotonVariante variant="guardar" type="submit" />
							</DrawerFooter>
						</Formulario>
					</div>
				</DrawerContent>
			</Drawer>
			<VentanaConfirmar
				open={confirmar}
				onClose={() => {
					setConfirmar(false);
				}}
				onConfirm={() => {
					setEdited(false);
					setConfirmar(false);
					onClose();
				}}
				title="Cerrar Formulario"
				description="Está seguro que desea cerrar el formulario? Perderá todos sus cambios realizados."
				variant="cierre"
			/>
		</>
	);
}
