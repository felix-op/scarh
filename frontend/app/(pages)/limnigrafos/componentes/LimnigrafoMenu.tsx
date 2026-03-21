import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@componentes/components/ui/menubar";
import Icon from "@componentes/icons/Icon";

export default function LimnigrafoMenu() {
	return (
		<Menubar className="h-12 border-none bg-background-muted overflow-hidden p-0 shadow-none">
			<MenubarMenu>
				<div className="flex justify-between w-full">
					<MenubarTrigger
						className="w-10 flex justify-center cursor-pointer rounded-sm p-0 py-2 hover:bg-hover"
					>
						<span className="icon-[qlementine-icons--menu-dots-16] text-4xl" />
					</MenubarTrigger>
				</div>
				<MenubarContent className="bg-sidebar mr-16" side="bottom">
					<MenubarItem
						className="hover:bg-sidebar-link-hover cursor-pointer text-xl"
						onClick={() => {}}
					>
						<span className="icon-[material-symbols--add-rounded] text-2xl"/>
						Importar Datos
					</MenubarItem>
					<MenubarItem
						className="hover:bg-sidebar-link-hover cursor-pointer text-xl"
						onClick={() => {}}
					>
						<Icon variant="funcion" className="text-2xl" />
						Calcular Estadísticas
					</MenubarItem>
					<MenubarItem
						className="hover:bg-sidebar-link-hover cursor-pointer text-xl"
						onClick={() => {}}
					>
						<Icon variant="documento" className="text-2xl" />
						Ver mediciones
					</MenubarItem>
					<MenubarItem
						className="hover:bg-sidebar-link-hover cursor-pointer text-xl"
						onClick={() => {}}
					>
						<Icon variant="mapa" className="text-2xl" />
						Agregar ubicación
					</MenubarItem>
					<MenubarItem
						className="hover:bg-sidebar-link-hover cursor-pointer text-xl text-error"
						onClick={() => {}}
					>
						<Icon variant="eliminar" className="text-2xl" />
						Eliminar
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
