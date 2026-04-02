"use client";

import { useState } from "react";
import PasoNuevaPassword from "./PasoNuevaPassword";
import PasoSolicitar from "./PasoSolicitar";
import PasoVerificar from "./PasoVerificar";

export default function FlujoRecuperacion() {
	const [paso, setPaso] = useState<1 | 2 | 3>(1);
	const [email, setEmail] = useState("");

	const avanzarPaso2 = (correo: string) => {
		setEmail(correo);
		setPaso(2);
	};

	const avanzarPaso3 = () => {
		setPaso(3);
	};

	return (
		<div className="z-10 w-full max-w-md">
			{paso === 1 && <PasoSolicitar onNext={avanzarPaso2} />}
			{paso === 2 && <PasoVerificar email={email} onNext={avanzarPaso3} />}
			{paso === 3 && <PasoNuevaPassword />}
		</div>
	);
}
