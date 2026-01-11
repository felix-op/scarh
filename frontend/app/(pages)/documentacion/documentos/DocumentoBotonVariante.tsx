import { CodigoDoc } from "../componentes/CodigoDoc";
import PalabraDoc from "../componentes/PalabraDoc";
import TarjetaDoc from "../componentes/TarjetaDoc";

export default function DocumentoBotonVariante() {
	const ejemploBasico = `<BotonVariante variant="agregar" />
<BotonVariante variant="eliminar" loading={true} />`;

	const ejemploPersonalizado = `<BotonVariante variant="login" onClick={handleLogin}>
	Acceder al Sistema
</BotonVariante>`;

	return (
		<TarjetaDoc>
			<h3 id="componente-botonvariante">
				BotonVariante
			</h3>
			
			<p>
				Componente de botón polimórfico. Incluye estados automáticos, manejo de iconos dinámicos y un efecto visual de brillo (shine) en hover.
			</p>
			<br />

			<p className="text-foreground">
				Soporta variantes predefinidas que inyectan automáticamente el <PalabraDoc>icono</PalabraDoc>, el <PalabraDoc>texto</PalabraDoc> y los <PalabraDoc>estilos</PalabraDoc> correspondientes (claro/oscuro) definidos en el tema.
			</p>
			<br />

			<h4>Propiedades (Props)</h4>
			<ul className="list-disc ml-6 space-y-2">
				<li><PalabraDoc>variant</PalabraDoc>: Determina la estética y contenido (login, agregar, editar, eliminar, etc.).</li>
				<li><PalabraDoc>loading</PalabraDoc>: Sustituye el icono de la variante por un spinner animado.</li>
				<li><PalabraDoc>disabled</PalabraDoc>: Deshabilita la interacción y reduce la opacidad.</li>
				<li><PalabraDoc>children</PalabraDoc>: Si se provee, sobrescribe el contenido automático (icono + texto).</li>
			</ul>
			<br />

			<h4>Ejemplo de uso</h4>
			<CodigoDoc codigo={ejemploBasico} />
			<br />

			<h4>Uso con Children</h4>
			<p>Puedes pasar contenido personalizado si no deseas usar los textos por defecto del sistema.</p>
			<CodigoDoc codigo={ejemploPersonalizado} />

			<h4>Efectos Visuales</h4>
			<p>
				El botón integra la animación <PalabraDoc>animate-shine</PalabraDoc> mediante un pseudo-elemento inclinado que recorre el botón al pasar el cursor.
			</p>
		</TarjetaDoc>
	);
}