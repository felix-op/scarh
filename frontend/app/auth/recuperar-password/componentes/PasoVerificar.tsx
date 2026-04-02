"use client";

import BotonBase from "@componentes/botones/BotonBase";
import CampoInput from "@componentes/campos/CampoInput";
import Seccion from "@componentes/secciones/Seccion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

type PasoVerificarProps = {
	email: string;
	onNext: () => void;
};

type FormValues = {
	codigo: string;
};

export default function PasoVerificar({ email, onNext }: PasoVerificarProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		defaultValues: { codigo: "" }
	});

	const onSubmit = async (data: FormValues) => {
		setLoading(true);
		setError(null);

		const result = await signIn("recuperar-password", {
			email,
			codigo: data.codigo,
			redirect: false,
		});

		if (result?.error) {
            // NextAuth returns error descriptions depending on authorize function errors
			setError(result.error);
			setLoading(false);
		} else if (result?.ok) {
			// Session created successfully, emit event to advance
			onNext();
		}
	};

	return (
		<Seccion className="max-w-2xl">
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormProvider {...form}>
					<h2 className="text-3xl font-bold text-[#0982C8] mb-2 text-center">
						Código de Verificación
					</h2>
					<p className="text-gray-600 text-sm text-center mb-4">
						Hemos enviado un código a <strong>{email}</strong>. Ingresa el código de 6 dígitos a continuación.
					</p>

					<CampoInput
						label="Código"
						name="codigo"
						type="text"
						placeholder="123456"
						icon="icon-[mdi--lock-outline] text-gray-600"
						disabled={loading}
						required
					/>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}

					<BotonBase
						disabled={loading}
						type="submit"
						variant="login"
						icon={loading ? "loading" : "none"}
					>Verificar y continuar</BotonBase>
				</FormProvider>
			</form>
		</Seccion>
	);
}
