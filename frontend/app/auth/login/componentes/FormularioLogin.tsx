"use client";

import BotonBase from "@componentes/botones/BotonBase";
import CampoInput from "@componentes/campos/CampoInput";
import Seccion from "@componentes/secciones/Seccion";
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

	const [showPassword, setShowPassword] = useState(false);

	return (
		<Seccion className="max-w-2xl sm:h-auto justify-end">
			<h2 className="text-4xl font-bold text-[#0982C8]">SCARH</h2>
			<CampoInput
				label="Nombre de usuario"
				name="username"
				type="text"
				placeholder="Ingrese su nombre de usuario"
				icon="icon-[mdi--user] text-gray-600"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				disabled={loading}
			/>

			<CampoInput
				label="Contraseña"
				name="password"
				type={showPassword ? "text" : "password"}
				placeholder="Ingrese su contraseña"
				icon="icon-[mdi--lock] text-gray-600"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				disabled={loading}
				endDecorations={[
					{
						className: `${showPassword ? 'icon-[mdi--eye-off]' : 'icon-[mdi--eye]'} text-gray-600 hover:text-gray-800 cursor-pointer`,
						onClick: () => setShowPassword((prev) => !prev)
					}
				]}
			/>

			{error && <p className="text-red-500">{error.message}</p>}

			<BotonBase
				onClick={() => onSubmit({username, password})}
				disabled={loading}
				variant="login"
				icon={loading ? "loading": "none"}
			/>
		</Seccion>
	);
}