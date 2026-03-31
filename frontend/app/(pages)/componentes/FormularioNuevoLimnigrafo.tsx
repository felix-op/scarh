import BotonVariante from "@componentes/botones/BotonVariante";
import Formulario from "@componentes/formularios/Formulario";

export default function FormularioNuevoLimnigrafo() {
	const valoresIniciales = {};

	const onSubmit = (data) => {
		console.log("Data: ", data);
	}

	const onDirty = () => {
		console.log("Formulario modificado!");
	}

	return (
		<Formulario valoresIniciales={valoresIniciales} onSubmit={onSubmit} onDirty={onDirty}>
			<BotonVariante type="submit" variant="agregar" />
		</Formulario>
	);
}