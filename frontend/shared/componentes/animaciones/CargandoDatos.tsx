import LoadingNube from "./LoadingNube";

type CargandoDatosProps = {
	children?: string;
}

export default function CargandoDatos({ children }: CargandoDatosProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<LoadingNube />
			{ children || (
				<p>Conectando con la base de datos...</p>
			)}
		</div>
	);
}
