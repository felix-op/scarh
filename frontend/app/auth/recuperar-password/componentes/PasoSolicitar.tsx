"use client";

import BotonBase from "@componentes/botones/BotonBase";
import CampoInput from "@componentes/campos/CampoInput";
import Seccion from "@componentes/secciones/Seccion";
import solicitarRecuperacion from "@servicios/autenticacion/solicitarRecuperacion";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type PasoSolicitarProps = {
	onNext: (email: string) => void;
};

type FormValues = {
	email: string;
};

export default function PasoSolicitar({ onNext }: PasoSolicitarProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [exito, setExito] = useState<string | null>(null);

	const form = useForm<FormValues>({
		defaultValues: { email: "" }
	});

	const onSubmit = async (data: FormValues) => {
		setLoading(true);
		setError(null);
		setExito(null);

		try {
			const res = await solicitarRecuperacion(data.email);
            // It could be that the backend replies successfully, which allows us to proceed.
            // If we want the user to see the success message first, we can either wait or proceed directly. 
            // In the UI, advancing directly to the next page where they enter the code makes the most sense.
            // But requirement says: "Mostrar mensaje devuelto por el backend. Luego de enviar correctamente, avanza al siguiente paso."
			const msg = res?.detail || "Se ha enviado un correo con las instrucciones.";
			setExito(msg);
			
			setTimeout(() => {
				onNext(data.email);
			}, 2000);
		} catch (err: any) {
			setError(err.message || "No se pudo procesar la solicitud.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Seccion className="max-w-2xl">
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormProvider {...form}>
					<h2 className="text-3xl font-bold text-[#0982C8] mb-2 text-center">
						Recuperar Contraseña
					</h2>
					<p className="text-gray-600 text-sm text-center mb-4">
						Ingresa tu correo electrónico y te enviaremos un código de validación.
					</p>
					
					<CampoInput
						label="Correo Electrónico"
						name="email"
						type="email"
						placeholder="ejemplo@correo.com"
						icon="icon-[mdi--email] text-gray-600"
						disabled={loading || !!exito}
						required
					/>
					
					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					{exito && <p className="text-green-600 text-sm text-center font-medium">{exito}</p>}
					
					<BotonBase
						disabled={loading || !!exito}
						type="submit"
						variant="login"
						icon={loading ? "loading" : "none"}
					>Solicitar código</BotonBase>
					
					<div className="flex justify-center text-sm">
						<Link href="/auth/login" className="text-gray-500 hover:text-gray-700">
							Volver a iniciar sesión
						</Link>
					</div>
				</FormProvider>
			</form>
		</Seccion>
	);
}
