import SearchField from "@componentes/campos/SearchField";
import Label from "@componentes/formularios/Label";

type FiltroBusquedaProps = {
	label: string
	placeholder: string
	initialSearch?: string
	onSearch: (value: string) => void
}

export default function FiltroBusqueda({ label, placeholder, initialSearch, onSearch }: FiltroBusquedaProps) {

	return (
		<div className="flex flex-col gap-2">
			<Label name="busqueda" text={label || ""} />
			<SearchField
				placeholder={placeholder}
				initialSearch={initialSearch}
				onSearch={onSearch}
			/>
		</div>
	);
}
