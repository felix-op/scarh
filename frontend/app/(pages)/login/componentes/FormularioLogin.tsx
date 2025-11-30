import Boton from "@componentes/Boton";
import CampoInput from "@componentes/campos/CampoInput";
import LoginCredentials from "@tipos/LoginCredentials";
import { useState } from "react";

type FormularioLoginProps = {
    onSubmit: (credentials: LoginCredentials) => void;
    loading	: boolean;
    error: Error | null;
};

export default function FormularioLogin({onSubmit, loading, error}: FormularioLoginProps) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	return (
		<div className="
			flex flex-col gap-6 w-full max-w-[720px]
			p-6 rounded-lg bg-white/80 backdrop-blur-lg
			border border-border relative z-2
		">
			<CampoInput
				label="Nombre de usuario"
				name="username"
				type="text"
				placeholder="example"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>

			<CampoInput
				label="Contraseña"
				name="password"
				type="password"
				placeholder="******"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>

			{error && <p className="text-red-500">{error.message}</p>}

			<Boton onClick={() => onSubmit({username, password})} className="w-full gap-2" disabled={loading}>
				{loading && <span className="icon-[line-md--loading-twotone-loop]" />}
				Iniciar Sesión
			</Boton>
		</div>
	);
}