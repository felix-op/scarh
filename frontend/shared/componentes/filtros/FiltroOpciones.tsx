import Selector from "@componentes/campos/Selector"
import Label from "@componentes/formularios/Label"

type TOpcion = {
	label: string
	value: string
}

type FiltroOpcionesProps = {
	title: string
	options: TOpcion[]
	onSelect: (value: string) => void
}

export default function FiltroOpciones({ options, title, onSelect }: FiltroOpcionesProps) {
	return (
		<div className="flex flex-col gap-2 w-full">
			<Label name={title} text={title} />
			<Selector id={title} name={title} containerStyle={{ boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)", flexGrow: 1 }} onChange={(e) => onSelect(e.target.value)}>
				{options.map((opcion, index) => (
					<option key={`filtro-${title}-${index}-${opcion.value}`} value={opcion.value}>{opcion.label}</option>
				))}
			</Selector>
		</div>
	);
}
