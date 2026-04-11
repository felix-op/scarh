import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@componentes/components/ui/menubar";
import Icon from "@componentes/icons/Icon";
import { IconVariants } from "@componentes/icons/Icon";
import { ReactNode } from "react";

export type MenuOpcion = {
	label: ReactNode;
	value: string;
	onClick?: (value: string) => void;
	iconVariant?: IconVariants;
	icon?: ReactNode;
}

export type MenuAccionesProps = {
	opciones: MenuOpcion[];
};

export default function MenuAcciones({
	opciones,
}: MenuAccionesProps) {
	return (
		<Menubar className="h-12 bg-inherit border-none overflow-hidden p-0 shadow-none">
			<MenubarMenu>
				<div className="flex justify-between w-full">
					<MenubarTrigger
						className="w-10 flex justify-center cursor-pointer rounded-sm p-0 py-2 hover:bg-sidebar-link-hover"
					>
						<span className="icon-[qlementine-icons--menu-dots-16] text-4xl" />
					</MenubarTrigger>
				</div>
				<MenubarContent className="bg-sidebar mr-16" side="bottom">
					{opciones.map((opcion) => (
						<MenubarItem
							key={opcion.value}
							className="cursor-pointer text-xl hover:bg-sidebar-link"
							onClick={() => {
								if (opcion.onClick) {
									opcion.onClick(opcion.value);
								}
							}}
						>
							{opcion?.iconVariant ? (
								<Icon variant={opcion.iconVariant} />
							) : opcion?.icon ? (
								opcion.icon
							) : null}
							{opcion.label}
						</MenubarItem>
					))}
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
