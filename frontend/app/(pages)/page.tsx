import PaginaBase from "@componentes/base/PaginaBase";
import VisualizacionLimnigrafos from "./componentes/VisualizacionLimnigrafos";
import VisualizacionEstadisticas from "./componentes/VisualizacionEstadisticas";


export default function Home() {
	return (
		<PaginaBase>
			<h1>Dashboard</h1>
			<br />
			<VisualizacionEstadisticas />
			<br />
			<VisualizacionLimnigrafos />
		</PaginaBase>
	);
}
