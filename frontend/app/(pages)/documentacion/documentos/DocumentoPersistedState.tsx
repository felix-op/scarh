import { CodigoDoc } from "../componentes/CodigoDoc";
import PalabraDoc from "../componentes/PalabraDoc";
import TablaDoc from "../componentes/TablaDoc";
import TarjetaDoc from "../componentes/TarjetaDoc";

export default function DocumentoPersistedState() {
	const hookParams = [
		{ 
			name: "key", 
			type: "string", 
			description: "Clave única para identificar el dato en el localStorage." 
		},
		{ 
			name: "initialValue", 
			type: "T (Generic)", 
			description: "Valor por defecto si no existe nada guardado en el navegador." 
		}
	];

	const ejemploUso = `// Persistir un objeto de usuario
const [user, setUser] = usePersistedState("user-prefs", { theme: "dark", lang: "es" });

// Persistir un contador
const [count, setCount] = usePersistedState("count", 0);`;

	return (
		<TarjetaDoc>
			<h3 id="hook-persistedstate">
				usePersistedState
			</h3>
			
			<p>
				Permite sincronizar cualquier estado de React con 
				<PalabraDoc>localStorage</PalabraDoc>. Soporta cualquier tipo porque usa 
				<PalabraDoc>JSON.parse/stringify</PalabraDoc>.
			</p>
			<br />

			<h4>Parámetros de entrada</h4>
			<TablaDoc data={hookParams} />

			<h4>Ejemplo de uso</h4>
			<CodigoDoc codigo={ejemploUso} />

			<h4>Retorno</h4>
			<p>
				Devuelve una tupla <PalabraDoc>[state, setState]</PalabraDoc> con el tipo de dato 
				inferido del <PalabraDoc>initialValue</PalabraDoc>.
			</p>
		</TarjetaDoc>
	);
}