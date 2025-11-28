"use client";

import { useState } from "react";
import Boton from "./Boton";

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
		<div
			style={{
				width: "100%",
				maxWidth: 691,
				padding: 24,
				background: "rgba(255,255,255,0.80)",
				borderRadius: 8,
				outline: "1px solid #D9D9D9",
				backdropFilter: "blur(18px)",
				display: "flex",
				flexDirection: "column",
				gap: 24,
			}}
		>
			{/* EMAIL */}
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<label style={{ fontSize: 16, color: "#1E1E1E" }}>Email</label>
				<input
					type="email"
					placeholder="example@gmail.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					style={{
						width: "100%",
						padding: "12px 16px",
						background: "white",
						borderRadius: 8,
						border: "1px solid #D9D9D9",
						outline: "none",
						color: "#1E1E1E",
						fontSize: 16,
					}}
				/>
			</div>

			{/* CONTRASEÑA */}
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<label style={{ fontSize: 16, color: "#1E1E1E" }}>Contraseña</label>

				<input
					type="password"
					placeholder="******"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={{
						width: "100%",
						padding: "12px 16px",
						background: "white", 
						borderRadius: 8,
						border: "1px solid #D9D9D9",
						outline: "none",
						color: "#1E1E1E",
						fontSize: 16,
					}}
				/>
			</div>

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
