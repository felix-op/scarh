"use client";

import { useState } from "react";
import Boton from "./Boton";
import CampoInput from "./campos/CampoInput";

// definimos la forma de las props
type LoginCardProps = {
  onLogin?: (email: string, password: string) => void;
};

export default function LoginCard({ onLogin }: LoginCardProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function handleSubmit() {
		if (onLogin) {
			onLogin(email, password);
		}
	}

	return (
		<div className="
			flex flex-col gap-6 w-full max-w-[720px]
			p-6 rounded-lg bg-white/80 backdrop-blur-lg
			border border-border relative z-2
		">
			<CampoInput
				label="Email"
				name="email"
				type="email"
				placeholder="example@gmail.com"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>

			<CampoInput
				label="Contraseña"
				name="password"
				type="password"
				placeholder="******"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			
			{/* BOTÓN */}
			<Boton
				onClick={handleSubmit}
				className="w-full"
			>
				Iniciar Sesión
			</Boton>
		</div>
	);
}
