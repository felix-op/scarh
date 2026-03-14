import Label from "@componentes/formularios/Label";

type FiltroFechaProps = {
	title: string
	onChangeInicio: (value: string) => void
	onChangeFin: (value: string) => void
}

export default function FiltroFecha({ title, onChangeInicio, onChangeFin }: FiltroFechaProps) {
	const nombreDesde = `filtro-desde-${title}`;
	const nombreHasta = `filtro-hasta-${title}`;

	return (
		<div className="flex flex-col gap-2 justify-start w-full">
			<Label name={`filtro-fecha-${title}`} text={title} />
			<div className="flex flex-col sm:flex-row items-center gap-2">
				<Label name={nombreDesde} text="Desde:" />
				<input
					type='date'
					id={nombreDesde}
					name={nombreDesde}
					onChange={(e) => onChangeInicio(e.target.value)}
					className={`
                                            w-full p-3 bg-campo-input rounded-lg border border-border
                                            outline-none text-foreground uppercase
                                        `}
					style={{ boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)" }}
				/>
				<Label name={nombreHasta} text="Hasta:" />
				<input
					type='date'
					id={nombreHasta}
					name={nombreHasta}
					onChange={(e) => onChangeFin(e.target.value)}
					className={`
                                            w-full p-3 bg-campo-input rounded-lg border border-border
                                            outline-none text-foreground uppercase
                                        `}
					style={{ boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)" }}
				/>
			</div>
		</div>
	);
}
