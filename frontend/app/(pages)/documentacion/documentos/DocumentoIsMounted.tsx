import { CodigoDoc } from "../componentes/CodigoDoc";
import PalabraDoc from "../componentes/PalabraDoc";
import TarjetaDoc from "../componentes/TarjetaDoc";

export default function DocumentoIsMounted() {
	const ejemploUso = `const mounted = useIsMounted();

if (!mounted) {
    return <div className="h-screen bg-background" />; // Skeleton o placeholder
}

return <Sidebar />;`;

	return (
		<TarjetaDoc>
			<h3 id="hook-ismounted">
				useIsMounted
			</h3>
			
			<p>
				Permite manejar la hidratación en Next.js. Detecta cuándo el componente se ha montado en el cliente, evitando discrepancias entre el renderizado del servidor y el del navegador.
			</p>
			<br />

			<p className="text-foreground">
				Se utiliza principalmente para proteger componentes que dependen de APIs globales como 
				<PalabraDoc>window</PalabraDoc>, <PalabraDoc>localStorage</PalabraDoc> o librerías de terceros que solo funcionan en el cliente.
			</p>
			<br />

			<h4>Ejemplo de uso</h4>
			<CodigoDoc codigo={ejemploUso} />

			<h4>Retorno</h4>
			<p>
				Devuelve un valor <PalabraDoc>boolean</PalabraDoc> que es <PalabraDoc>false</PalabraDoc> durante el SSR y el primer renderizado, y cambia a <PalabraDoc>true</PalabraDoc> una vez montado.
			</p>
		</TarjetaDoc>
	);
}