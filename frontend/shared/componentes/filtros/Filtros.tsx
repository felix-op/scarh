import TextField from "@componentes/campos/TextField";
import { useState } from "react";

export default function Filtros({  }) {
	const [busqueda, setBusqueda] = useState("");

	return (
		<div>
			<div className="w-150">
				<TextField
					value={busqueda}
					onChange={(e) => setBusqueda(e.target.value)}
					style={{
						borderRadius: "20px",
						boxShadow: "0px 4px 2px rgba(0, 0, 0, 0.1)",
					}}
					placeholder="Buscar por nombre, nombre de usuario, legajo o email"
					icon="icon-[mdi--magnify]"
					endDecoration={{
						className: "icon-[fa7-solid--remove] text-sm right-4 hover:cursor-pointer hover:text-principal ",
						onClick: () => setBusqueda(""),
					}}
				/>
			</div>
		</div>
	);
}